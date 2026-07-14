// src/components/fatura/FaturaItens.jsx
import React, { useMemo } from 'react';
import { Package } from 'lucide-react';
import './FaturaItens.css';

/**
 * Componente para exibir os itens de uma fatura
 * 
 * @param {Array} itens - Lista de itens da fatura
 * @param {string} moeda - Moeda (ex: "MZN")
 * @param {boolean} showHeader - Mostrar cabeçalho
 * @param {boolean} compact - Modo compacto
 */
export const FaturaItens = ({ 
  itens = [], 
  moeda = 'MZN', 
  showHeader = true,
  compact = false,
  onItemClick = null
}) => {
  // ============================================================
  // CÁLCULO DOS TOTAIS
  // ============================================================
  const totals = useMemo(() => {
    const subtotal = itens.reduce((acc, item) => acc + (item.total || 0), 0);
    
    let taxaIva = 16;
    if (itens.length > 0) {
      if (itens[0].taxaIva) {
        taxaIva = Number(itens[0].taxaIva);
      } else if (itens[0].iva && itens[0].total) {
        taxaIva = (itens[0].iva / itens[0].total) * 100;
      }
    }
    
    const totalIva = subtotal * (taxaIva / 100);
    const total = subtotal + totalIva;
    
    return { 
      subtotal, 
      iva: totalIva, 
      total,
      taxaIva
    };
  }, [itens]);

  // ============================================================
  // FUNÇÕES AUXILIARES
  // ============================================================

  const formatarMoeda = (valor) => {
    if (valor === undefined || valor === null) return 'MT 0,00';
    return `MT ${Number(valor).toLocaleString('pt-MZ', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const renderIva = (item) => {
    if (item.taxaIva) {
      return `${Number(item.taxaIva).toFixed(0)}%`;
    }
    if (item.iva && item.total && item.total > 0) {
      const taxa = (item.iva / item.total) * 100;
      return `${taxa.toFixed(0)}%`;
    }
    return '0%';
  };

  const getIvaClass = (taxa) => {
    const taxaNum = Number(taxa);
    if (taxaNum === 0) return 'iva-zero';
    if (taxaNum >= 20) return 'iva-alto';
    return 'iva-positivo';
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (!itens || itens.length === 0) {
    return (
      <div className="fatura-itens-empty">
        <Package size={32} className="empty-icon" />
        <p>Nenhum item encontrado nesta fatura</p>
      </div>
    );
  }

  return (
    <div className={`fatura-itens ${compact ? 'fatura-itens-compact' : ''}`}>
      
      {/* Cabeçalho */}
      {showHeader && (
        <div className="fatura-itens-header">
          <h3 className="fatura-itens-title">
            <Package size={18} />
            Itens da Fatura
          </h3>
          <span className="fatura-itens-count">
            {itens.length} {itens.length === 1 ? 'item' : 'itens'}
          </span>
        </div>
      )}

      {/* Tabela de Itens */}
      <div className="fatura-itens-table-wrapper">
        <table className="fatura-itens-table">
          <thead>
            <tr>
              <th className="col-descricao">Descrição</th>
              <th className="col-qtd">Qtd</th>
              <th className="col-preco">Preço Unit.</th>
              <th className="col-iva">IVA</th>
              <th className="col-total">Total</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, index) => (
              <tr 
                key={item.id || index} 
                className={`fatura-item-row ${onItemClick ? 'clickable' : ''}`}
                onClick={() => onItemClick && onItemClick(item)}
              >
                <td className="col-descricao">
                  <div className="item-descricao">
                    <span className="item-numero">{index + 1}</span>
                    <span className="item-nome">{item.descricao || item.nome || 'Item'}</span>
                  </div>
                </td>
                <td className="col-qtd">
                  <span className="item-quantidade">
                    {item.quantidade || item.qtd || 1}
                  </span>
                </td>
                <td className="col-preco">
                  <span className="item-preco">
                    {formatarMoeda(item.precoUnitario || item.preco || 0)}
                  </span>
                </td>
                <td className="col-iva">
                  <span className={`item-iva ${getIvaClass(item.taxaIva || 0)}`}>
                    {renderIva(item)}
                  </span>
                </td>
                <td className="col-total">
                  <span className="item-total">
                    {formatarMoeda(item.total || 0)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          
          {/* Rodapé com totais */}
          <tfoot>
            <tr className="fatura-total-row">
              <td colSpan="3" className="total-label">Subtotal</td>
              <td colSpan="2" className="total-value">
                {formatarMoeda(totals.subtotal)}
              </td>
            </tr>
            {totals.iva > 0 && (
              <tr className="fatura-iva-row">
                <td colSpan="3" className="total-label">
                  IVA ({totals.taxaIva ? `${totals.taxaIva.toFixed(0)}%` : '16%'})
                </td>
                <td colSpan="2" className="total-value">
                  {formatarMoeda(totals.iva)}
                </td>
              </tr>
            )}
            <tr className="fatura-total-geral-row">
              <td colSpan="3" className="total-label total-geral-label">Total</td>
              <td colSpan="2" className="total-value total-geral-valor">
                {formatarMoeda(totals.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Resumo Rápido (compacto) */}
      {compact && (
        <div className="fatura-itens-resumo">
          <span>Subtotal: {formatarMoeda(totals.subtotal)}</span>
          <span className="resumo-divider">|</span>
          <span>IVA ({totals.taxaIva ? `${totals.taxaIva.toFixed(0)}%` : '16%'}): {formatarMoeda(totals.iva)}</span>
          <span className="resumo-divider">|</span>
          <span className="resumo-total">Total: {formatarMoeda(totals.total)}</span>
        </div>
      )}
    </div>
  );
};

export default FaturaItens;