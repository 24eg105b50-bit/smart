import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { catalogApi } from '../../api/apiServices';
import ProductCard from '../../components/product/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Sparkles,
  ArrowRight,
  Laptop,
  BookOpen,
  Headphones,
  Cpu,
  Bookmark,
  ShieldCheck,
  Truck,
  Repeat,
} from 'lucide-react';

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          catalogApi.getCategories(),
          catalogApi.getProducts({ size: 8, sortBy: 'createdAt', sortDir: 'desc' }),
        ]);

        if (catRes.success) setCategories(catRes.data);
        if (prodRes.success && prodRes.data?.content) {
          setFeaturedProducts(prodRes.data.content);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-900 text-white rounded-3xl p-8 sm:p-14 border border-slate-800 shadow-xl">
        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI-Powered Campus Store • AU-R24 Aligned</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Smart Shopping for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              Smarter Students.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Everything for your engineering journey: prescribed AU-R24 textbooks, coding laptops,
            mechanical keyboards, Arduino lab kits, and study essentials with 24-hour hostel delivery.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition"
            >
              Browse Campus Catalog
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              Ask AI Assistant
            </Link>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Category Shortcuts */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Academic Categories</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Curated departments for college coursework</p>
          </div>
          <Link to="/catalog" className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog?categoryId=${cat.id}`}
              className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 card-hover flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition line-clamp-1">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured / Trending Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Trending on Campus</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Most requested semester supplies by students</p>
          </div>
          <Link to="/catalog" className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700">
            Explore All Products →
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading campus catalog..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* AI Assistant Callout Banner */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 sm:p-12 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            AI Student Advisory
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Unsure which laptop or textbook suits your course?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our AI Assistant analyzes your branch requirements, budget, and semester curriculum to recommend
            exact catalog items with zero guesswork.
          </p>
        </div>

        <Link
          to="/ai-assistant"
          className="shrink-0 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Chat with Assistant
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
