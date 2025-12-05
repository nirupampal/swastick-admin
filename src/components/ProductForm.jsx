import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Upload, Save, Languages, AlertCircle } from 'lucide-react';
import { Input } from './ui/Input'; // Ensure this path is correct
import toast from 'react-hot-toast';
import api from '../utils/api';

// --- HELPER 1: Simple List Builder (e.g. Benefits, Pack Sizes) ---
const SimpleListBuilder = ({ title, items, onChange, placeholder, required = false }) => {
  const addRow = () => onChange([...items, '']);
  const removeRow = (index) => onChange(items.filter((_, i) => i !== index));
  const handleChange = (val, index) => {
    const newItems = [...items];
    newItems[index] = val;
    onChange(newItems);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => handleChange(e.target.value, index)}
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder={placeholder}
            />
            <button 
              type="button" 
              onClick={() => removeRow(index)} 
              className="text-slate-400 hover:text-red-500 p-2 rounded transition-colors"
              title="Remove item"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-slate-400 italic px-1">No items added yet.</p>}
        <button 
          type="button" 
          onClick={addRow} 
          className="text-sm text-emerald-600 font-semibold flex items-center gap-1 hover:underline mt-2"
        >
          <Plus size={16} /> Add New Item
        </button>
      </div>
    </div>
  );
};

// --- HELPER 2: Key-Value Builder (e.g. Composition) ---
const KeyValueBuilder = ({ title, items, onChange, keyLabel, valueLabel }) => {
  const addRow = () => onChange([...items, { key: '', value: '' }]);
  const removeRow = (index) => onChange(items.filter((_, i) => i !== index));
  const handleChange = (field, val, index) => {
    const newItems = [...items];
    newItems[index][field] = val;
    onChange(newItems);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {title} <span className="text-slate-400 font-normal text-xs ml-1">(Optional)</span>
      </label>
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={item.key}
              onChange={(e) => handleChange('key', e.target.value, index)}
              className="w-1/3 px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder={keyLabel}
            />
            <input
              value={item.value}
              onChange={(e) => handleChange('value', e.target.value, index)}
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder={valueLabel}
            />
            <button 
              type="button" 
              onClick={() => removeRow(index)} 
              className="text-slate-400 hover:text-red-500 p-2 rounded transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-slate-400 italic px-1">No data added.</p>}
        <button 
          type="button" 
          onClick={addRow} 
          className="text-sm text-emerald-600 font-semibold flex items-center gap-1 hover:underline mt-2"
        >
          <Plus size={16} /> Add Row
        </button>
      </div>
    </div>
  );
};

// --- INITIAL DATA STATE ---
const initialLangData = {
  title: '',
  subtitle: '',
  description: '',
  storage: '',
  safety: '',
  benefits: [],
  composition: [], 
  cropRecs: [],    
  usage: {
    timing: '',
    general: '',
    methods: []
  }
};

export default function ProductForm({ product, onClose, onSuccess }) {
  const [activeLang, setActiveLang] = useState('en');
  const [loading, setLoading] = useState(false);
  
  // --- Global State ---
  const [packSizes, setPackSizes] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // --- Localized State ---
  const [formData, setFormData] = useState({
    en: { ...initialLangData },
    hi: { ...initialLangData }
  });

  // Load data on edit
  useEffect(() => {
    if (product) {
      setPackSizes(product.pack_sizes || []);
      setPreview(product.image_url);

      const newFormData = { en: { ...initialLangData }, hi: { ...initialLangData } };
      
      const objToArray = (obj) => obj ? Object.entries(obj).map(([key, value]) => ({ key, value })) : [];

      ['en', 'hi'].forEach(lang => {
        const source = product.translations?.[lang] || (lang === 'en' ? product : {});
        
        newFormData[lang] = {
          title: source.title || '',
          subtitle: source.subtitle || '',
          description: source.description || '',
          storage: source.storage || '',
          safety: source.safety || '',
          benefits: source.benefits || [],
          composition: objToArray(source.composition),
          cropRecs: objToArray(source.crop_recommendations),
          usage: {
            timing: source.usage_info?.timing || '',
            general: source.usage_info?.general || '',
            methods: source.usage_info?.method || (Array.isArray(source.usage_info) ? source.usage_info : [])
          }
        };
      });

      setFormData(newFormData);
    }
  }, [product]);

  // --- HANDLERS ---
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [activeLang]: { ...prev[activeLang], [name]: value }
    }));
  };

  const handleUsageChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        usage: { ...prev[activeLang].usage, [field]: value }
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // --- VALIDATION & SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate Required Fields
    const cleanPackSizes = packSizes.filter(s => s.trim() !== '');
    if (cleanPackSizes.length === 0) {
      toast.error('Please add at least one Pack Size.');
      // Scroll to top to see error
      document.querySelector('.scroll-container')?.scrollTo(0,0);
      return;
    }

    if (!formData.en.title.trim()) {
      toast.error('English Product Name is required.');
      setActiveLang('en');
      return;
    }

    setLoading(true);

    try {
      const formPayload = new FormData();

      // Append Global Data
      if (image) formPayload.append('image', image);
      if (product && !image) formPayload.append('existing_image_url', product.image_url);
      
      formPayload.append('pack_sizes', JSON.stringify(cleanPackSizes));

      // Append Localized Data
      const translationsPayload = {};

      ['en', 'hi'].forEach(lang => {
        const data = formData[lang];

        // Convert UI Arrays back to Objects
        const compositionObj = data.composition.reduce((acc, curr) => {
          if (curr.key.trim()) acc[curr.key] = curr.value;
          return acc;
        }, {});

        const cropRecsObj = data.cropRecs.reduce((acc, curr) => {
          if (curr.key.trim()) acc[curr.key] = curr.value;
          return acc;
        }, {});

        translationsPayload[lang] = {
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          storage: data.storage,
          safety: data.safety,
          benefits: data.benefits.filter(b => b.trim() !== ''),
          composition: compositionObj,
          crop_recommendations: cropRecsObj,
          usage_info: {
            timing: data.usage.timing,
            general: data.usage.general,
            method: data.usage.methods.filter(m => m.trim() !== '')
          }
        };
      });

      formPayload.append('translations', JSON.stringify(translationsPayload));

      // API Call
      if (product) {
        await api.put(`/products/${product.id}`, formPayload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', formPayload);
        toast.success('Product created successfully!');
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentData = formData[activeLang];

  return (
    <motion.div 
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      className="fixed inset-y-0 right-0 w-full md:w-[850px] bg-white shadow-2xl z-50 flex flex-col"
    >
      {/* --- HEADER --- */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {product ? <Save className="text-emerald-600" size={20}/> : <Plus className="text-emerald-600" size={20}/>}
            {product ? 'Edit Product' : 'Create New Product'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Fill in the details below. Required fields are marked with <span className="text-red-500">*</span></p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition">
          <X size={24} />
        </button>
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      <div className="flex-1 overflow-y-auto p-6 scroll-container bg-slate-50/50">
        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
          
          {/* SECTION 1: GLOBAL DETAILS */}
          <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Upload size={14} /> Global Details (Shared across languages)
            </h3>
            
            <div className="flex gap-6 flex-col md:flex-row">
              {/* Image Input */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product Image <span className="text-slate-400 font-normal text-xs ml-1">(Optional)</span>
                </label>
                <div className="relative group w-full h-40 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-emerald-400 transition-colors cursor-pointer">
                  {preview ? (
                    <>
                      <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                        Change Image
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-slate-400 pointer-events-none">
                      <Upload className="mx-auto mb-2 opacity-50" />
                      <span className="text-xs">Click to upload PNG/JPG</span>
                    </div>
                  )}
                  <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
              </div>

              {/* Pack Sizes Input */}
              <div className="flex-1">
                <SimpleListBuilder 
                  title="Pack Sizes" 
                  items={packSizes} 
                  onChange={setPackSizes} 
                  placeholder="e.g. 500ml, 1kg" 
                  required={true}
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: LANGUAGE TABS */}
          <div className="sticky top-0 z-20 bg-slate-50/50 backdrop-blur-sm pt-2 pb-4">
            <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm inline-flex w-full md:w-auto">
               <button
                 type="button"
                 onClick={() => setActiveLang('en')}
                 className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                   activeLang === 'en' 
                   ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
                   : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                 }`}
               >
                 <span>🇺🇸</span> English Input
               </button>
               <button
                 type="button"
                 onClick={() => setActiveLang('hi')}
                 className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                   activeLang === 'hi' 
                   ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
                   : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                 }`}
               >
                 <span>🇮🇳</span> Hindi Input
               </button>
            </div>
            
            <div className="mt-3 flex items-start gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-xs">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <p>
                You are currently editing <strong>{activeLang === 'en' ? 'English' : 'Hindi'}</strong> content. 
                Switch tabs to translate the information manually.
              </p>
            </div>
          </div>

          {/* SECTION 3: LOCALIZED FORM FIELDS */}
          <motion.div 
            key={activeLang} 
            initial={{ opacity: 0, y: 5 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Basic Info Group */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                Basic Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-5">
                <Input 
                  label={<span>Product Name <span className="text-red-500">*</span></span>}
                  name="title" 
                  value={currentData.title} 
                  onChange={handleTextChange} 
                  placeholder={activeLang === 'hi' ? "उत्पाद का नाम" : "Product Name"} 
                  required
                />
                <Input 
                  label={<span>Subtitle <span className="text-slate-400 font-normal text-xs">(Optional)</span></span>} 
                  name="subtitle" 
                  value={currentData.subtitle} 
                  onChange={handleTextChange} 
                  placeholder={activeLang === 'hi' ? "संक्षिप्त विवरण" : "Short Tagline"} 
                />
              </div>
              
              <Input 
                label={<span>Description <span className="text-slate-400 font-normal text-xs">(Optional)</span></span>} 
                name="description" 
                textarea 
                value={currentData.description} 
                onChange={handleTextChange} 
                placeholder="Detailed summary of the product..." 
              />
            </div>

            {/* Technical Specs Group */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                Technical Specifications
              </h3>
              <KeyValueBuilder 
                title="Chemical Composition" 
                items={currentData.composition} 
                onChange={(val) => setFormData(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], composition: val } }))}
                keyLabel={activeLang === 'hi' ? "घटक (e.g. Nitrogen)" : "Ingredient"} 
                valueLabel="Value (e.g. 10%)" 
              />
            </div>

            {/* Application & Benefits Group */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                Application & Benefits
              </h3>

              <div className="grid md:grid-cols-2 gap-5 bg-slate-50 p-4 rounded-lg">
                 <Input 
                   label="Timing (When to apply)" 
                   value={currentData.usage.timing} 
                   onChange={(e) => handleUsageChange('timing', e.target.value)} 
                   placeholder="e.g. Early morning" 
                 />
                 <Input 
                   label="General Dose" 
                   value={currentData.usage.general} 
                   onChange={(e) => handleUsageChange('general', e.target.value)} 
                   placeholder="e.g. 5ml per liter" 
                 />
              </div>

              <SimpleListBuilder 
                title="Application Methods" 
                items={currentData.usage.methods} 
                onChange={(val) => handleUsageChange('methods', val)}
                placeholder="e.g. Foliar Spray"
              />

              <KeyValueBuilder 
                title="Crop Recommendations" 
                items={currentData.cropRecs} 
                onChange={(val) => setFormData(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], cropRecs: val } }))}
                keyLabel="Crop (e.g. Wheat)" 
                valueLabel="Dose (e.g. 50kg/acre)" 
              />

              <SimpleListBuilder 
                title="Key Benefits" 
                items={currentData.benefits} 
                onChange={(val) => setFormData(prev => ({ ...prev, [activeLang]: { ...prev[activeLang], benefits: val } }))}
                placeholder="e.g. Increases yield" 
              />
            </div>

            {/* Safety Group */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
               <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                 Safety & Storage
               </h3>
               <div className="grid md:grid-cols-2 gap-5">
                 <Input 
                   label={<span>Storage Info <span className="text-slate-400 font-normal text-xs">(Optional)</span></span>} 
                   name="storage" 
                   value={currentData.storage} 
                   onChange={handleTextChange} 
                   placeholder="e.g. Keep in cool dry place"
                 />
                 <Input 
                   label={<span>Safety Precautions <span className="text-slate-400 font-normal text-xs">(Optional)</span></span>} 
                   name="safety" 
                   value={currentData.safety} 
                   onChange={handleTextChange} 
                   placeholder="e.g. Wear gloves"
                 />
               </div>
            </div>

          </motion.div>
        </form>
      </div>

      {/* --- FOOTER ACTIONS --- */}
      <div className="p-4 bg-white border-t border-slate-200 flex gap-4 items-center justify-end z-20">
        <button 
          type="button" 
          onClick={onClose}
          disabled={loading}
          className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="px-8 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
             <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Saving...</span>
          ) : (
             <>
               <Save size={18} /> Save Product
             </>
          )}
        </button>
      </div>
    </motion.div>
  );
}