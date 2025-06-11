import React from 'react';
import Head from 'next/head';
import ComandaCocina from '../components/ComandaCocina';

const ComandaPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Comanda Digital - Cocina | Sistema POS Honduras</title>
        <meta name="description" content="Comanda digital para la cocina del restaurante" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <style>{`
          body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
            background-color: #f5f5f5;
          }
          
          /* Estilos para pantalla completa */
          .comanda-fullscreen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 9999;
            background: #f5f5f5;
          }
          
          /* Animaciones para nuevos pedidos */
          @keyframes nuevoPedido {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          .nuevo-pedido {
            animation: nuevoPedido 0.5s ease-in-out;
          }
          
          /* Estilos para impresión */
          @media print {
            body * {
              visibility: hidden;
            }
            .comanda-print, .comanda-print * {
              visibility: visible;
            }
            .comanda-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
          
          /* Responsive para tablets */
          @media (max-width: 768px) {
            .comanda-card {
              margin-bottom: 16px;
            }
          }
        `}</style>
      </Head>
      
      <div className="comanda-fullscreen">
        <ComandaCocina />
      </div>
    </>
  );
};

export default ComandaPage; 