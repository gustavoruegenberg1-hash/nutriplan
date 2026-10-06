import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Apple,
  Search,
  Calculator,
  ChevronRight,
  Database,
} from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  source: string;
  baseVersion?: string;
  unit: string;
  referenceQuantity: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  lipids: number;
  fiber: number;
  sodium: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isLactoseFree?: boolean;
}

export const FoodCatalog: React.FC = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Calculadora de Porção Proporcional (RN10)
  const [calcFood, setCalcFood] = useState<FoodItem | null>(null);
  const [calcGrams, setCalcGrams] = useState<number>(150);
  const [calculatedPortion, setCalculatedPortion] = useState<any>(null);

  // Carrega categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/foods/categories');
        setCategories(res.data);
      } catch {
        // ignore
      }
    };
    fetchCategories();
  }, []);

  // Busca alimentos com debounce
  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      try {
        const res = await api.get('/foods', {
          params: {
            query: searchQuery || undefined,
            category: selectedCategory || undefined,
            tag: selectedTag || undefined,
            limit: 40,
          },
        });
        setFoods(res.data);
        if (!calcFood && res.data.length > 0) {
          setCalcFood(res.data[0]);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchFoods, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedTag]);

  // Recalcula porção sempre que o alimento ou os gramas mudam (RN10)
  useEffect(() => {
    if (!calcFood || calcGrams <= 0) {
      setCalculatedPortion(null);
      return;
    }

    const calcPortion = async () => {
      try {
        const res = await api.get(`/foods/${calcFood.id}/portion/${calcGrams}`);
        setCalculatedPortion(res.data);
      } catch {
        // Fallback para cálculo proporcional local em caso de erro de rede transitório
        const factor = calcGrams / (calcFood.referenceQuantity || 100);
        setCalculatedPortion({
          food: calcFood,
          grams: calcGrams,
          calories: Math.round(calcFood.calories * factor * 10) / 10,
          protein: Math.round(calcFood.protein * factor * 10) / 10,
          carbohydrates: Math.round(calcFood.carbohydrates * factor * 10) / 10,
          lipids: Math.round(calcFood.lipids * factor * 10) / 10,
          fiber: Math.round((calcFood.fiber || 0) * factor * 10) / 10,
          sodium: Math.round((calcFood.sodium || 0) * factor * 10) / 10,
        });
      }
    };

    const timer = setTimeout(calcPortion, 150);
    return () => clearTimeout(timer);
  }, [calcFood, calcGrams]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-12 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Tabela Nutricional TACO
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <Database size={12} />
              744 Alimentos Oficiais
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Base científica da Tabela Brasileira de Composição de Alimentos (UNICAMP/NEPA, 4ª Edição). Sem estimativas fictícias (RN10/RN11).
          </p>
        </div>
      </div>

      {/* Widget Interativo de Cálculo Proporcional (RN10) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
            <Calculator size={20} />
            <span>Simulador Proporcional de Porção (RN10)</span>
          </div>
          <span className="text-xs text-slate-400">
            Fórmula: <code className="text-emerald-300 bg-slate-800/80 px-2 py-0.5 rounded">Nutriente = Ref × Gramas / 100</code>
          </span>
        </div>

        {calcFood ? (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-400">Alimento selecionado:</span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {calcFood.name}
                  <span className="text-xs font-normal px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {calcFood.category}
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-300 whitespace-nowrap">Porção Consumida:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    step="5"
                    value={calcGrams}
                    onChange={(e) => setCalcGrams(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-center focus:outline-none focus:border-emerald-500 text-sm"
                  />
                  <span className="text-sm font-semibold text-slate-400">gramas</span>
                </div>
              </div>
            </div>

            {/* Resultado do Cálculo */}
            {calculatedPortion && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Calorias</div>
                  <div className="text-xl font-extrabold text-amber-400 mt-0.5">
                    {calculatedPortion.calories} <span className="text-xs font-normal text-slate-400">kcal</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">100g: {calcFood.calories} kcal</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Proteínas</div>
                  <div className="text-xl font-extrabold text-rose-400 mt-0.5">
                    {calculatedPortion.protein} <span className="text-xs font-normal text-slate-400">g</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">100g: {calcFood.protein}g</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Carboidratos</div>
                  <div className="text-xl font-extrabold text-sky-400 mt-0.5">
                    {calculatedPortion.carbohydrates} <span className="text-xs font-normal text-slate-400">g</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">100g: {calcFood.carbohydrates}g</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Gorduras</div>
                  <div className="text-xl font-extrabold text-amber-300 mt-0.5">
                    {calculatedPortion.lipids} <span className="text-xs font-normal text-slate-400">g</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">100g: {calcFood.lipids}g</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Fibras</div>
                  <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                    {calculatedPortion.fiber ?? '-'} <span className="text-xs font-normal text-slate-400">g</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">100g: {calcFood.fiber ?? '-'}g</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Sódio</div>
                  <div className="text-xl font-extrabold text-purple-400 mt-0.5">
                    {calculatedPortion.sodium ?? '-'} <span className="text-xs font-normal text-slate-400">mg</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">100g: {calcFood.sodium ?? '-'}mg</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Selecione um alimento na lista abaixo para simular porções personalizadas.</p>
        )}
      </div>

      {/* Controles de Busca e Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome (ex: Arroz, Frango, Banana)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { label: 'Todos', tag: '' },
            { label: 'Proteico', tag: 'alto-proteina' },
            { label: 'Zero Carb', tag: 'baixo-carb' },
            { label: 'Fibras', tag: 'rico-fibras' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setSelectedTag(item.tag)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedTag === item.tag
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela / Cards de Alimentos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Exibindo {foods.length} alimentos encontrados</span>
          <span>Valores de referência baseados em 100g de porção crua ou cozida</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Pesquisando base TACO...
          </div>
        ) : foods.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
            <Apple size={36} className="mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">Nenhum alimento encontrado com esses filtros.</p>
            <p className="text-xs text-slate-500">Tente buscar por outro termo ou remover a categoria selecionada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {foods.map((food) => {
              const isSelected = calcFood?.id === food.id;
              return (
                <div
                  key={food.id}
                  onClick={() => setCalcFood(food)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-white text-sm line-clamp-2 leading-snug">{food.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                        100g
                      </span>
                    </div>
                    <span className="text-xs text-emerald-400 font-medium">{food.category}</span>
                  </div>

                  {/* Grid de Macros por 100g */}
                  <div className="grid grid-cols-4 gap-1 bg-slate-950/70 p-2 rounded-lg text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Kcal</span>
                      <span className="font-extrabold text-amber-400">{Math.round(food.calories)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Prot</span>
                      <span className="font-extrabold text-rose-400">{food.protein}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Carb</span>
                      <span className="font-extrabold text-sky-400">{food.carbohydrates}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Gord</span>
                      <span className="font-extrabold text-amber-300">{food.lipids}g</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/40">
                    <span>Fibras: {food.fiber ? `${food.fiber}g` : '0g'}</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      Simular Porção <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
