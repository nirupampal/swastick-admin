import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Plus, Package, AlertTriangle } from 'lucide-react';
import ProductForm from '../components/ProductForm';
import AdminNavbar from '../components/AdminNavbar'; // Import the Navbar
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // State to control which language is displayed in the list
  const [viewLang, setViewLang] = useState('en'); 

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.list || []);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  // Helper to extract display info based on selected viewLang
  const getDisplayInfo = (p) => {
    // 1. Try selected language
    if (p.translations?.[viewLang]) {
        return p.translations[viewLang];
    }
    // 2. Fallback to English (if viewing Hindi but Hindi data is missing)
    if (p.translations?.en) {
        return p.translations.en;
    }
    // 3. Fallback to root (old data structure)
    return p;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Navbar is placed here at the top level */}
      <AdminNavbar viewLang={viewLang} setViewLang={setViewLang} />

      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Product Inventory</h1>
            <p className="text-slate-500 mt-1">
              Viewing catalog in <span className="font-bold text-emerald-600 uppercase">{viewLang === 'en' ? 'English' : 'Hindi'}</span>
            </p>
          </div>
          <button 
            onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-emerald-200 active:scale-95"
          >
            <Plus size={20} /> Add Product
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const display = getDisplayInfo(product);
            
            // Check if data actually exists for the selected language
            const isMissingTranslation = viewLang === 'hi' && !product.translations?.hi;

            return (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-100 overflow-hidden transition-all group relative"
              >
                {/* Image Area */}
                <div className="h-48 overflow-hidden bg-slate-50 relative">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={display.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                      <Package size={48} />
                    </div>
                  )}
                  
                  {/* Warning if translation missing */}
                  {isMissingTranslation && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                       <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm">
                         <AlertTriangle size={14} /> Hindi Missing
                       </div>
                    </div>
                  )}
                </div>
                
                {/* Content Area */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-slate-800 mb-1 leading-tight">
                    {display.title || <span className="text-slate-300 italic">Untitled</span>}
                  </h3>
                  
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2 truncate">
                    {display.subtitle || "—"}
                  </p>
                  
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10 leading-relaxed">
                    {display.description || "No description available."}
                  </p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">
                      {product.pack_sizes ? product.pack_sizes.length : 0} Sizes
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setEditingProduct(product); setIsFormOpen(true); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Slide-over Form */}
        <AnimatePresence>
          {isFormOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                onClick={() => setIsFormOpen(false)}
                className="fixed inset-0 bg-black z-40"
              />
              <ProductForm 
                product={editingProduct} 
                onClose={() => setIsFormOpen(false)} 
                onSuccess={() => { setIsFormOpen(false); fetchProducts(); }}
              />
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}