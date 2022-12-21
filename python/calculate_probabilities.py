import json
import pandas
import pickle

def calculate_probabilities (argv):
	papel = argv[0]
	params = [float(x) for x in argv[1:-1]]

	data = pandas.DataFrame([params], columns = [
		'dias_passados', 'preco_abertura', 'dias_consecutivos', 'balanco', 'variacao_preco_maximo_1',
		'variacao_preco_minimo_1', 'variacao_preco_medio_1', 'variacao_preco_ultimo_negocio_1',
		'variacao_preco_melhor_oferta_compra_1', 'variacao_preco_melhor_oferta_venda_1', 'volume_por_negociacao_1',
		'volume_total_1', 'variacao_acc_1', 'variacao_1', 'variacao_acc_2', 'variacao_2', 'variacao_acc_3',
		'variacao_3', 'variacao_acc_4', 'variacao_4', 'variacao_acc_5', 'variacao_5', 'variacao_acc_6', 'variacao_6',
		'variacao_acc_7', 'variacao_7', 'variacao_acc_8', 'variacao_8', 'variacao_acc_9', 'variacao_9',
		'variacao_acc_10', 'variacao_10', 'variacao_acc_11', 'variacao_11', 'variacao_acc_12', 'variacao_12',
		'variacao_acc_13', 'variacao_13', 'variacao_acc_14', 'variacao_14', 'variacao_acc_15', 'variacao_15',
		'variacao_acc_16', 'variacao_16', 'variacao_acc_17', 'variacao_17', 'variacao_acc_18', 'variacao_18',
		'variacao_acc_19', 'variacao_19', 'variacao_acc_20', 'variacao_20', 'variacao_acc_21', 'variacao_21',
		'variacao_acc_22', 'variacao_22', 'variacao_acc_23', 'variacao_23', 'variacao_acc_24', 'variacao_24',
		'variacao_acc_25', 'variacao_25', 'variacao_acc_26', 'variacao_26', 'variacao_acc_27', 'variacao_27',
		'variacao_acc_28', 'variacao_28', 'variacao_acc_29', 'variacao_29', 'variacao_acc_30', 'variacao_30'
	])

	# Carrega as colunas a serem mantidas para se obter a melhor qualidade para esse papel
	with open(f"./papeis/{papel}/best-fit.json", "r") as file:
		best = json.load(file)
		to_remove = data.columns.difference(best["to_keep"])
		data.drop(to_remove, inplace = True, axis = 1)

	# Carrega o classificador
	with open(f'./papeis/{papel}/classificador.pkl', 'rb') as file:
		gaussian = pickle.load(file)
		predictions_proba = gaussian.predict_proba(data)
		prediction = gaussian.predict(data)
		classes = gaussian.classes_.tolist()

	idx_r_1 = classes.index("R < -1%") if "R < -1%" in classes else -1
	idx_r_05 = classes.index("-1% <= R <= 0%") if "-1% <= R <= 0%" in classes else -1
	idx_r05 = classes.index("0% < R <= 1%") if "0% < R <= 1%" in classes else -1
	idx_r1 = classes.index("R > 1%") if "R > 1%" in classes else -1

	r_1 = predictions_proba[0][idx_r_1] if idx_r_1 != -1 else 0
	r_05 = predictions_proba[0][idx_r_05] if idx_r_05 != -1 else 0
	r05 = predictions_proba[0][idx_r05] if idx_r05 != -1 else 0
	r1 = predictions_proba[0][idx_r1] if idx_r1 != -1 else 0

	# Carrega os dados da experimentação
	with open(f"./papeis/{papel}/experimentacao.json", "r") as file:
		experimentation = json.load(file)

		sum = (r_1 * experimentation[f"P(D = {prediction[0]} | E = R < -1%)"])
		sum += (r_05 * experimentation[f"P(D = {prediction[0]} | E = -1% <= R <= 0%)"])
		sum += (r05 * experimentation[f"P(D = {prediction[0]} | E = 0% < R <= 1%)"])
		sum += (r1 * experimentation[f"P(D = {prediction[0]} | E = R > 1%)"])

		# Se sum for igual a zero é porque previu uma descoberta que não foi prevista durante a experimentação,
		# logo é melhor ignorar esse papel dizendo que a probabilidade de prejuízo de 1% é de 100%
		if sum <= 0:
			return {
				"ticket": papel,
				"prediction": prediction[0],
				"r_1": 1,
				"r_05": 0,
				"r05": 0,
				"r1": 0
			}

		return {
			"ticket": papel,
			"prediction": prediction[0],
			"r_1": r_1 * experimentation[f"P(D = {prediction[0]} | E = R < -1%)"] / sum,
			"r_05": r_05 * experimentation[f"P(D = {prediction[0]} | E = -1% <= R <= 0%)"] / sum,
			"r05": r05 * experimentation[f"P(D = {prediction[0]} | E = 0% < R <= 1%)"] / sum,
			"r1": r1 * experimentation[f"P(D = {prediction[0]} | E = R > 1%)"] / sum
		}
