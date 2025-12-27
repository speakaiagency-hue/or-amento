
import React, { useState, useRef } from 'react';
import { Plus, Trash2, Calculator, Send, Camera, FileDown, MapPin } from 'lucide-react';
import { Quote, QuoteItem, MaterialType, BusinessProfile } from '../types';
import { PDFTemplate } from './PDFTemplate';
import ReactDOM from 'react-dom/client';

interface QuoteFormProps {
  onSave: (quote: Quote) => void;
  initialQuote?: Quote | null;
  business: BusinessProfile;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({ onSave, initialQuote, business }) => {
  const [clientName, setClientName] = useState(initialQuote?.clientName || '');
  const [clientPhone, setClientPhone] = useState(initialQuote?.clientPhone || '');
  const [clientAddress, setClientAddress] = useState(initialQuote?.clientAddress || '');
  const [laborCost, setLaborCost] = useState<number | string>(initialQuote?.laborCost ?? '');
  const [items, setItems] = useState<QuoteItem[]>(initialQuote?.items || []);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      width: '',
      height: '',
      quantity: 1,
      material: MaterialType.IRON,
      pricePerUnit: '',
      description: ''
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateItem(id, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + (Number(item.pricePerUnit || 0) * (Number(item.quantity) || 0)), 0);
  };

  const currentLaborCost = Number(laborCost || 0);
  const total = calculateSubtotal() + currentLaborCost;

  const generatePDF = async () => {
    if (!clientName) {
      alert("Por favor, preencha o nome do cliente.");
      return;
    }
    
    setIsGeneratingPdf(true);
    const quoteData: Quote = {
      id: initialQuote?.id || 'NOVO',
      clientName,
      clientPhone,
      clientAddress,
      date: new Date().toLocaleDateString(),
      items,
      laborCost: currentLaborCost,
      discount: 0,
      total,
      status: 'pending'
    };

    const container = document.getElementById('pdf-container');
    if (!container) return;
    
    const root = ReactDOM.createRoot(container);
    root.render(<PDFTemplate quote={quoteData} business={business} />);

    await new Promise(resolve => setTimeout(resolve, 800));

    const element = document.getElementById('pdf-render-target');
    const opt = {
      margin: 0,
      filename: `Orcamento_${clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    window.html2pdf().from(element).set(opt).save().then(() => {
      setIsGeneratingPdf(false);
      root.unmount();
    }).catch((err: any) => {
      console.error(err);
      setIsGeneratingPdf(false);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuote: Quote = {
      id: initialQuote?.id || Math.random().toString(36).substr(2, 9),
      clientName,
      clientPhone,
      clientAddress,
      date: initialQuote?.date || new Date().toLocaleDateString(),
      items,
      laborCost: currentLaborCost,
      discount: 0,
      total,
      status: 'pending'
    };
    onSave(newQuote);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      <div className="bg-white p-4 rounded-xl shadow-sm space-y-4 border border-gray-100">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Calculator className="text-orange-500" size={20} />
          Dados do Cliente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Cliente</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3 border text-base"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: João Silva"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
            <input
              type="tel"
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3 border text-base"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
            <MapPin size={14} /> Endereço da Obra (Opcional)
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3 border text-base"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            placeholder="Rua, Número, Bairro, Cidade"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Itens e Medidas</h3>
          <button
            type="button"
            onClick={addItem}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 text-sm font-bold shadow-sm active:scale-95 transition"
          >
            <Plus size={18} /> Adicionar Item
          </button>
        </div>

        {items.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3 relative">
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="absolute top-2 right-2 text-red-500 p-2 hover:bg-red-50 rounded-full z-10"
            >
              <Trash2 size={20} />
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Nome do Item</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-200 p-3 border focus:ring-1 focus:ring-orange-500 text-base"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  placeholder="Ex: Portão de Correr"
                />
              </div>

              <div className="col-span-2 flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Material</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-200 p-3 border bg-white text-base"
                    value={item.material}
                    onChange={(e) => updateItem(item.id, 'material', e.target.value)}
                  >
                    {Object.values(MaterialType).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Foto</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={el => { fileInputRefs.current[item.id] = el; }}
                    onChange={(e) => handleImageUpload(item.id, e)}
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRefs.current[item.id]?.click()}
                    className={`mt-1 w-full flex items-center justify-center p-3 rounded-md border ${item.image ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-400'}`}
                  >
                    {item.image ? <img src={item.image} className="w-8 h-8 object-cover rounded shadow-sm" /> : <Camera size={24} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Largura (m)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="mt-1 block w-full rounded-md border-gray-200 p-3 border text-base"
                  value={item.width}
                  onChange={(e) => updateItem(item.id, 'width', e.target.value === '' ? '' : e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Altura (m)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="mt-1 block w-full rounded-md border-gray-200 p-3 border text-base"
                  value={item.height}
                  onChange={(e) => updateItem(item.id, 'height', e.target.value === '' ? '' : e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Qtd</label>
                <input
                  type="number"
                  placeholder="1"
                  className="mt-1 block w-full rounded-md border-gray-200 p-3 border text-base"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', e.target.value === '' ? '' : e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Preço Un. (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="mt-1 block w-full rounded-md border-gray-200 p-3 border text-base font-bold text-orange-700"
                  value={item.pricePerUnit}
                  onChange={(e) => updateItem(item.id, 'pricePerUnit', e.target.value === '' ? '' : e.target.value)}
                />
              </div>
              <div className="col-span-2">
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Observações</label>
                 <textarea
                  className="mt-1 block w-full rounded-md border-gray-200 p-3 border text-base"
                  rows={2}
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Ex: Pintura preta, chapa 18..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Custo Adicional (Frete / Mão de Obra)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
            <input
              type="number"
              placeholder="0.00"
              className="w-full bg-slate-800 border-none rounded-xl p-4 pl-12 text-white text-2xl font-black focus:ring-2 focus:ring-orange-500 outline-none text-center"
              value={laborCost}
              onChange={(e) => setLaborCost(e.target.value === '' ? '' : e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 text-2xl font-black border-t border-slate-800">
          <span className="text-orange-500 text-sm uppercase tracking-tighter">TOTAL:</span>
          <span className="text-orange-50">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sticky bottom-6 pb-4 bg-gray-50/90 backdrop-blur-md pt-2 px-1">
        <button
          type="button"
          onClick={generatePDF}
          disabled={isGeneratingPdf || items.length === 0}
          className="w-full bg-slate-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition active:scale-[0.98] shadow-md disabled:opacity-50"
        >
          {isGeneratingPdf ? "Gerando PDF..." : <><FileDown size={22} /> Gerar Orçamento PDF</>}
        </button>
        <button
          type="submit"
          className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-orange-200 hover:bg-orange-700 active:scale-[0.98] transition text-lg"
        >
          Salvar Orçamento <Send size={22} />
        </button>
      </div>
    </form>
  );
};
