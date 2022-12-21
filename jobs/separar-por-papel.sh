#!/bin/bash

# Separa os dados por papel

# Entra no working directory correto
cd "$1"

# Processar todos os papéis
primeiro_papel=1
ultimo_papel=`wc -l ../papeis.txt | awk '{ print $1 }'`

if [[ ! (-d "./raw-data/generated-csv/papeis") ]]; then
	mkdir "./raw-data/generated-csv/papeis"
fi

for ((i = $primeiro_papel; i <= $ultimo_papel; i++)); do
	papel=`head -n $i ../papeis.txt | tail -n 1`
	papel_trimmed=`head -n $i ../papeis.txt | tail -n 1 | xargs`

	if [[ -e "./raw-data/generated-csv/papeis/$papel_trimmed/dados.csv" ]]; then
		# echo -e "Pulando $papel_trimmed por já estar pronto.\n"
		continue
	fi

	# echo "Processando $papel_trimmed..."

	if [[ ! (-d "./raw-data/generated-csv/papeis/$papel_trimmed") ]]; then
		mkdir "./raw-data/generated-csv/papeis/$papel_trimmed"
	fi

	echo "data;cod_bdi;papel;tipo_mercado;nome_resumido;preco_abertura;preco_maximo;preco_minimo;preco_medio;preco_ultimo_negocio;preco_melhor_oferta_compra;preco_melhor_oferta_venda;total_negociacoes;quantidade_total;volume_total;" > "./raw-data/generated-csv/papeis/$papel_trimmed/dados.csv"

	for file in ./raw-data/generated-csv/COTAHIST_D*.csv; do
		# echo "  - $file"
		awk -F ";" -v papel="$papel" '$3 == papel' "$file" >> "./raw-data/generated-csv/papeis/$papel_trimmed/dados.csv"
	done

	# echo ""
done
