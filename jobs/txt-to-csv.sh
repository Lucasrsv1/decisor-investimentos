#!/bin/bash

# Converte o arquivo de dados brutos no arquivo de dados filtrados para cada ano

# Filtros:
#
#  - Tipos de Mercado (TPMERC):
#     - A Vísta: substr($0, 25, 3) == "010"
#
#  - Boletim Diário de Informações (CODBDI):
#     - Lote Padrão: substr($0, 11, 2) == "02"
#     - Fundos Imobiliários: substr($0, 11, 2) == "12"
#     - Certific. Investimento / Debêntures / Títulos Divida Pública: substr($0, 11, 2) == "14"
#     - Fracionário: substr($0, 11, 2) == "96"
#
#  - Moeda Usada:
#     - Real: substr($0, 53, 4) == "R$  "

echo "data;cod_bdi;papel;tipo_mercado;nome_resumido;preco_abertura;preco_maximo;preco_minimo;preco_medio;preco_ultimo_negocio;preco_melhor_oferta_compra;preco_melhor_oferta_venda;total_negociacoes;quantidade_total;volume_total;" | tee "$2"

awk '{
    if ( \
        (substr($0, 25, 3) == "010" || substr($0, 25, 3) == "020") && \
        ( \
            substr($0, 11, 2) == "02" || \
            substr($0, 11, 2) == "12" || \
            substr($0, 11, 2) == "14" || \
            substr($0, 11, 2) == "96" \
        ) && \
        substr($0, 53, 4) == "R$  " \
    ) { \
        print substr($0, 3, 4) "-" substr($0, 7, 2) "-" substr($0, 9, 2) ";" \
            substr($0, 11, 2) ";" \
            substr($0, 13, 12) ";" \
            substr($0, 25, 3) ";" \
            substr($0, 28, 12) ";" \
            substr($0, 57, 13) ";" \
            substr($0, 70, 13) ";" \
            substr($0, 83, 13) ";" \
            substr($0, 96, 13) ";" \
            substr($0, 109, 13) ";" \
            substr($0, 122, 13) ";" \
            substr($0, 135, 13) ";" \
            substr($0, 148, 5) ";" \
            substr($0, 153, 18) ";" \
            substr($0, 171, 18) ";"
    }
}' "$1" | tee -a "$2"
