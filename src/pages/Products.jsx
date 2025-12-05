import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Plus, Package, AlertTriangle, Search, Sparkles } from 'lucide-react';
import ProductForm from '../components/ProductForm';
import AdminNavbar from '../components/AdminNavbar';
import toast from 'react-hot-toast';

// Animation Variants for Staggered List
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewLang, setViewLang] = useState('en'); 

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data.list || []);
      setFilteredProducts(res.data.list || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setTimeout(() => setLoading(false), 500); // Small delay for smooth UI
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle Search Filtering
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = products.filter(p => {
      const display = getDisplayInfo(p);
      return (display.title?.toLowerCase() || '').includes(lowerTerm) || 
             (display.subtitle?.toLowerCase() || '').includes(lowerTerm);
    });
    setFilteredProducts(filtered);
  }, [searchTerm, products, viewLang]);

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

  const getDisplayInfo = (p) => {
    if (p.translations?.[viewLang]) return p.translations[viewLang];
    if (p.translations?.en) return p.translations.en;
    return p;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <AdminNavbar viewLang={viewLang} setViewLang={setViewLang} />

      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              Inventory <span className="text-emerald-500 text-lg font-mono bg-emerald-50 px-2 py-1 rounded-full">{products.length} Items</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Managing catalog in <span className="text-emerald-600 font-bold uppercase tracking-wider">{viewLang === 'en' ? 'English' : 'Hindi'}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>

            {/* Add Button */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-slate-200 hover:shadow-emerald-200 transition-all duration-300"
            >
              <Plus size={20} />
              <span>Add New</span>
            </motion.button>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <ProductSkeleton />
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredProducts.map((product) => {
                const display = getDisplayInfo(product);
                const isMissingTranslation = viewLang === 'hi' && !product.translations?.hi;

                return (
                  <motion.div 
                    key={product.id}
                    variants={itemVariants}
                    layout
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                  >
                    {/* Image Area */}
                    <div className="h-56 relative overflow-hidden bg-slate-100">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={display.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 bg-slate-50">
                          <Package size={48} strokeWidth={1.5} />
                          <span className="text-xs font-medium mt-2">No Image</span>
                        </div>
                      )}
                      
                      {/* Floating Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                         {/* Tag Example */}
                         <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-sm">
                            SKU: {product.id.toString().slice(-4)}
                         </div>
                      </div>

                      {/* Missing Translation Overlay */}
                      {isMissingTranslation && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-10 transition-opacity">
                           <div className="bg-amber-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg transform translate-y-2">
                             <AlertTriangle size={14} /> 
                             <span>Hindi Content Missing</span>
                           </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-800 leading-snug mb-1 group-hover:text-emerald-600 transition-colors">
                          {display.title || <span className="text-slate-300 italic">Untitled Product</span>}
                        </h3>
                        
                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">
                          {display.subtitle || "General"}
                        </p>
                        
                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed h-10 mb-4">
                          {display.description || "No description available for this item."}
                        </p>
                      </div>
                      
                      {/* Footer / Actions */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                          <Package size={14} />
                          {product.pack_sizes ? product.pack_sizes.length : 0} Variants
                        </div>

                        <div className="flex gap-2">
                          <ActionBtn 
                            icon={Edit2} 
                            onClick={() => { setEditingProduct(product); setIsFormOpen(true); }}
                            color="blue" 
                          />
                          <ActionBtn 
                            icon={Trash2} 
                            onClick={() => handleDelete(product.id)}
                            color="red" 
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 opacity-50">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No products found</h3>
            <p className="text-slate-500">Try adjusting your search or add a new item.</p>
          </div>
        )}

        {/* Modal Overlay */}
        <AnimatePresence>
          {isFormOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setIsFormOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
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

// Sub-component for Action Buttons
const ActionBtn = ({ icon: Icon, onClick, color }) => {
  const styles = {
    blue: "hover:bg-blue-50 hover:text-blue-600",
    red: "hover:bg-red-50 hover:text-red-600"
  };

  return (
    <button 
      onClick={onClick}
      className={`p-2 text-slate-400 rounded-lg transition-all duration-200 ${styles[color]} active:scale-95`}
    >
      <Icon size={18} />
    </button>
  );
};

// Skeleton Loader Component
const ProductSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[1, 2, 3, 4, 5, 6].map((n) => (
      <div key={n} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-[400px] animate-pulse">
        <div className="h-56 bg-slate-200" />
        <div className="p-5 space-y-3">
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-10 bg-slate-100 rounded w-full mt-4" />
          <div className="flex justify-between mt-6 pt-4 border-t border-slate-50">
            <div className="h-6 w-16 bg-slate-200 rounded" />
            <div className="h-8 w-20 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
);