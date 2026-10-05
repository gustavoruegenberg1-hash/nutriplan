import React, { useState } from 'react';
import { ShopItem, GameCharacter } from '../types/game';
import { ShoppingBag, Scissors, Palette, Shirt, Home, Coins, Check, X } from 'lucide-react';

interface GameShopModalProps {
  character: GameCharacter;
  isOpen: boolean;
  onClose: () => void;
  onBuyItem: (item: ShopItem) => void;
}

export const GameShopModal: React.FC<GameShopModalProps> = ({
  character,
  isOpen,
  onClose,
  onBuyItem,
}) => {
  const [activeCategory, setActiveCategory] = useState<'hair' | 'clothes' | 'housing'>('hair');

  const [catalog] = useState<ShopItem[]>([
    // Salão de Beleza & Barbearia
    {
      id: 'hair_braids',
      category: 'hair_style',
      name: 'Tranças Arcanas Ankama',
      price: 150,
      previewValue: 'braids',
      description: 'Penteado com fios entrelaçados estilo aventureiro de Dofus.',
      purchased: false,
    },
    {
      id: 'hair_color_ruby',
      category: 'hair_color',
      name: 'Tintura Vermelho Rubi',
      price: 100,
      previewValue: '#d90429',
      description: 'Cor vibrante extraída de pigmentos minerais de alta pureza.',
      purchased: false,
    },
    {
      id: 'hair_color_emerald',
      category: 'hair_color',
      name: 'Tintura Verde Esmeralda',
      price: 100,
      previewValue: '#06d6a0',
      description: 'Pigmento herbal que emite um brilho sutil sob a luz mágica.',
      purchased: false,
    },
    {
      id: 'hair_color_amethyst',
      category: 'hair_color',
      name: 'Tintura Violeta Ametista',
      price: 120,
      previewValue: '#7b2cbf',
      description: 'Tonalidade nobre dos mestres alquimistas da cidade.',
      purchased: false,
    },

    // Roupas
    {
      id: 'top_arcane_robe',
      category: 'top',
      name: 'Manto do Boticário Astral',
      price: 250,
      previewValue: 'arcane_robe',
      description: 'Tecido leve e resistente com runas bordadas a mão.',
      purchased: false,
    },
    {
      id: 'top_hoodie_dark',
      category: 'top',
      name: 'Moletom Urbano Streetwear',
      price: 180,
      previewValue: 'hoodie',
      description: 'Estilo contemporâneo casual perfeito para os estudos de magitech.',
      purchased: false,
    },

    // Casas / Imóveis
    {
      id: 'house_loft',
      category: 'furniture',
      name: 'Loft Urbano com Varanda (Grid 9x9)',
      price: 1200,
      previewValue: '🏡',
      description: 'Espaço ampliado com janelas de vidro duplo e espaço para 12 móveis.',
      purchased: false,
    },
    {
      id: 'house_penthouse',
      category: 'furniture',
      name: 'Cobertura Arcana com Terraço (Grid 12x12)',
      price: 3500,
      previewValue: '🏰',
      description: 'Residência de prestígio no topo da metrópole com vista panorâmica.',
      purchased: false,
    },
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0F172A] border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100 max-h-[90vh]">
        {/* Header da Loja */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-black shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Centro Comercial & Customização
              </h3>
              <p className="text-xs text-slate-400">
                Gaste os Kamas da sua profissão em beleza, moda e expansão imobiliária
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-500/30 text-xs font-mono font-bold text-amber-300">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{character.kamas} Kamas</span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Abas de Categorias */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveCategory('hair')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeCategory === 'hair'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Salão & Barbearia</span>
          </button>

          <button
            onClick={() => setActiveCategory('clothes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeCategory === 'clothes'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Boutique de Roupas</span>
          </button>

          <button
            onClick={() => setActiveCategory('housing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeCategory === 'housing'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Mercado Imobiliário</span>
          </button>
        </div>

        {/* Catálogo de Produtos */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {catalog
            .filter((item) => {
              if (activeCategory === 'hair') return item.category.startsWith('hair');
              if (activeCategory === 'clothes') return item.category === 'top';
              return item.category === 'furniture';
            })
            .map((item) => {
              const canAfford = character.kamas >= item.price;

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{item.name}</span>
                      {item.category === 'hair_color' && (
                        <span
                          className="w-5 h-5 rounded-full border-2 border-slate-600 shadow-sm"
                          style={{ backgroundColor: item.previewValue }}
                        />
                      )}
                      {item.category === 'furniture' && (
                        <span className="text-xl">{item.previewValue}</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-1 leading-snug">{item.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-amber-300 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      {item.price} Kamas
                    </span>

                    <button
                      onClick={() => onBuyItem(item)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                        canAfford
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 shadow-md cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Comprar</span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
