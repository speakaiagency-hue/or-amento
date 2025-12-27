
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { QuoteForm } from './components/QuoteForm';
import { Quote, BusinessProfile } from './types';
import { 
  PlusCircle, 
  FileText, 
  Clock, 
  User, 
  TrendingUp,
  Search,
  Upload,
  Building,
  Trash2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [business, setBusiness] = useState<BusinessProfile>({
    companyName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    const savedQuotes = localStorage.getItem('serralheria_quotes');
    if (savedQuotes) setQuotes(JSON.parse(savedQuotes));

    const savedBusiness = localStorage.getItem('serralheria_business');
    if (savedBusiness) setBusiness(JSON.parse(savedBusiness));
  }, []);

  useEffect(() => {
    localStorage.setItem('serralheria_quotes', JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem('serralheria_business', JSON.stringify(business));
  }, [business]);

  const handleSaveQuote = (quote: Quote) => {
    if (editingQuote) {
      setQuotes(quotes.map(q => q.id === quote.id ? quote : q));
    } else {
      setQuotes([quote, ...quotes]);
    }
    setEditingQuote(null);
    setActiveTab('history');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusiness({ ...business, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredQuotes = quotes.filter(q => 
    q.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.clientPhone.includes(searchQuery)
  );

  // Fix: Convert pricePerUnit and quantity to Number to avoid arithmetic errors with string|number types
  const statsData = [
    { name: 'Materiais', value: quotes.reduce((acc, q) => acc + q.items.reduce((iAcc, item) => iAcc + (Number(item.pricePerUnit || 0) * Number(item.quantity || 0)), 0), 0) },
    { name: 'Mão de Obra', value: quotes.reduce((acc, q) => acc + q.laborCost, 0) }
  ];

  const COLORS = ['#ea580c', '#334155'];

  const renderDashboard = () => {
    const totalEarnings = quotes.reduce((acc, q) => acc + q.total, 0);
    const pendingCount = quotes.filter(q => q.status === 'pending').length;

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-start mb-4">
             <div>
                <p className="text-slate-400 text-sm font-medium">Total em Orçamentos</p>
                <h2 className="text-3xl font-bold mt-1">R$ {totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
             </div>
             {business.logo && <img src={business.logo} className="w-12 h-12 object-contain bg-white rounded-lg p-1" />}
          </div>
          <div className="mt-4 flex gap-4">
            <div className="bg-white/10 p-3 rounded-xl flex-1">
              <p className="text-xs text-slate-300">Propostas</p>
              <p className="text-xl font-bold">{quotes.length}</p>
            </div>
            <div className="bg-orange-500/20 p-3 rounded-xl flex-1">
              <p className="text-xs text-orange-200">Pendentes</p>
              <p className="text-xl font-bold text-orange-400">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => setActiveTab('new')}
            className="bg-orange-600 p-6 rounded-2xl shadow-lg shadow-orange-100 flex items-center justify-between group active:scale-[0.98] transition"
          >
            <div className="flex items-center gap-4">
              <PlusCircle className="text-white" size={40} />
              <div className="text-left">
                <span className="block text-white font-bold text-lg">Novo Orçamento</span>
                <span className="text-orange-200 text-xs">Comece a medir agora</span>
              </div>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setActiveTab('history')}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 hover:bg-blue-50 transition active:scale-[0.98]"
            >
              <FileText className="text-blue-600" size={32} />
              <span className="text-sm font-bold text-gray-700">Histórico</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 hover:bg-slate-50 transition active:scale-[0.98]"
            >
              <User className="text-slate-600" size={32} />
              <span className="text-sm font-bold text-gray-700">Meu Perfil</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-700">
            <TrendingUp size={18} className="text-orange-500" />
            Análise de Custos Acumulados
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
             <div className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-600 rounded-full"></div> Itens</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-700 rounded-full"></div> Extras</div>
          </div>
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="space-y-4 animate-in slide-in-from-right duration-300">
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Buscar cliente ou telefone..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 transition"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filteredQuotes.length > 0 ? filteredQuotes.map(quote => (
          <div key={quote.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:scale-[0.99] transition relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2" onClick={() => { setEditingQuote(quote); setActiveTab('new'); }}>
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                  <User size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{quote.clientName}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {quote.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-600">R$ {quote.total.toLocaleString('pt-BR')}</p>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{quote.items.length} ITENS</div>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if(confirm('Deseja realmente excluir este orçamento?')) setQuotes(quotes.filter(q => q.id !== quote.id));
              }}
              className="absolute right-2 bottom-2 p-2 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )) : (
          <div className="text-center py-10 text-gray-400">
            <FileText size={48} className="mx-auto mb-2 opacity-20" />
            <p>Nenhum orçamento encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
           <Building size={20} className="text-orange-500" /> Perfil Profissional
        </h2>
        
        <div className="flex flex-col items-center gap-4 py-4 border-b">
           <div className="relative group cursor-pointer" onClick={() => document.getElementById('logo-upload')?.click()}>
              {business.logo ? (
                <img src={business.logo} className="w-24 h-24 object-contain border rounded-xl" />
              ) : (
                <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400">
                  <Upload size={24} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition">TROCAR LOGO</div>
           </div>
           <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleLogoUpload} />
           <p className="text-xs text-slate-500 font-medium">Sua logo aparecerá nos orçamentos PDF</p>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Nome da Empresa</label>
            <input type="text" className="w-full mt-1 border rounded-lg p-2 focus:ring-1 focus:ring-orange-500 outline-none" value={business.companyName} onChange={e => setBusiness({...business, companyName: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Seu Nome / Responsável</label>
            <input type="text" className="w-full mt-1 border rounded-lg p-2 focus:ring-1 focus:ring-orange-500 outline-none" value={business.ownerName} onChange={e => setBusiness({...business, ownerName: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
              <input type="tel" className="w-full mt-1 border rounded-lg p-2 focus:ring-1 focus:ring-orange-500 outline-none" value={business.phone} onChange={e => setBusiness({...business, phone: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
              <input type="email" className="w-full mt-1 border rounded-lg p-2 focus:ring-1 focus:ring-orange-500 outline-none" value={business.email} onChange={e => setBusiness({...business, email: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Endereço Profissional</label>
            <input type="text" className="w-full mt-1 border rounded-lg p-2 focus:ring-1 focus:ring-orange-500 outline-none" value={business.address} onChange={e => setBusiness({...business, address: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-100 rounded-xl space-y-4">
        <h3 className="font-bold text-slate-700">Manutenção</h3>
        <button 
          onClick={() => { if(confirm('Atenção: Todos os orçamentos e dados salvos serão apagados permanentemente. Deseja continuar?')) { setQuotes([]); localStorage.clear(); location.reload(); } }}
          className="w-full bg-white text-red-500 border border-red-200 font-bold py-3 rounded-lg text-sm hover:bg-red-50 transition"
        >
          Limpar Todos os Dados
        </button>
      </div>
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={(tab) => {
      setActiveTab(tab);
      if (tab !== 'new') setEditingQuote(null);
    }}>
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'new' && (
        <QuoteForm 
          onSave={handleSaveQuote} 
          initialQuote={editingQuote} 
          business={business}
        />
      )}
      {activeTab === 'history' && renderHistory()}
      {activeTab === 'settings' && renderSettings()}
    </Layout>
  );
};

export default App;
