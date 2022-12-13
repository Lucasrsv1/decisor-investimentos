import psycopg2
import re
import time

from flask import Flask
from flask_restful import Resource, Api

from calculate_probabilities import calculate_probabilities

app = Flask(__name__)
api = Api(app)

date_pattern = re.compile(r"^\d\d\d\d\-\d\d\-\d\d$")

columns = [
	"papel", "dias_passados", "preco_abertura", "dias_consecutivos", "balanco", "variacao_preco_maximo_1",
	"variacao_preco_minimo_1", "variacao_preco_medio_1", "variacao_preco_ultimo_negocio_1",
	"variacao_preco_melhor_oferta_compra_1", "variacao_preco_melhor_oferta_venda_1", "volume_por_negociacao_1",
	"volume_total_1", "variacao_acc_1", "variacao_1", "variacao_acc_2", "variacao_2", "variacao_acc_3",
	"variacao_3", "variacao_acc_4", "variacao_4", "variacao_acc_5", "variacao_5", "variacao_acc_6", "variacao_6",
	"variacao_acc_7", "variacao_7", "variacao_acc_8", "variacao_8", "variacao_acc_9", "variacao_9",
	"variacao_acc_10", "variacao_10", "variacao_acc_11", "variacao_11", "variacao_acc_12", "variacao_12",
	"variacao_acc_13", "variacao_13", "variacao_acc_14", "variacao_14", "variacao_acc_15", "variacao_15",
	"variacao_acc_16", "variacao_16", "variacao_acc_17", "variacao_17", "variacao_acc_18", "variacao_18",
	"variacao_acc_19", "variacao_19", "variacao_acc_20", "variacao_20", "variacao_acc_21", "variacao_21",
	"variacao_acc_22", "variacao_22", "variacao_acc_23", "variacao_23", "variacao_acc_24", "variacao_24",
	"variacao_acc_25", "variacao_25", "variacao_acc_26", "variacao_26", "variacao_acc_27", "variacao_27",
	"variacao_acc_28", "variacao_28", "variacao_acc_29", "variacao_29", "variacao_acc_30", "variacao_30"
]

class Probabilities (Resource):
	def get (self, date, investment):
		start = time.time()
		conn = None
		answer = { }

		if not date or not re.fullmatch(date_pattern, date):
			return { "code": 400, "message": "Data inválida. Padrão requerido: YYYY-MM-DD." }

		investment = float(investment)
		if not investment or not investment >= 1:
			return { "code": 400, "message": "O valor do investimento deve ser maior ou igual a R$ 1,00." }

		try:
			probabilities = []
			real_results = {}
			tickets = []
			conn = psycopg2.connect(
				host = "127.0.0.1",
				database = "decisor_investimentos",
				user = "postgres",
				password = "root"
			)

			cur = conn.cursor()
			cur.execute(f"""
				SELECT {', '.join(columns)}
				FROM dados_bayes
				WHERE data = '{date}' AND preco_abertura <= {investment}
			""")

			rows = cur.fetchall()
			for row in rows:
				probabilities.append(calculate_probabilities(row))
				real_results[row[0]] = { "preco_abertura": float(row[2]) }
				tickets.append(row[0])

			cur.close()

			# Calcula resultado real
			cur = conn.cursor()
			cur.execute(f"""
				SELECT DB.papel, DB.preco_abertura
				FROM dados_bayes DB
				INNER JOIN (
					SELECT papel, MIN(data) AS data
					FROM dados_bayes
					WHERE data > '{date}' AND papel IN ('{"', '".join(tickets)}')
					GROUP  BY papel
				) MD ON MD.papel = DB.papel AND MD.data = DB.data
				WHERE DB.data > '{date}' AND DB.papel IN ('{"', '".join(tickets)}')
			""")

			rows = cur.fetchall()
			for row in rows:
				real_results[row[0]]["proximo_preco"] = float(row[1])
				real_results[row[0]]["result"] = float(real_results[row[0]]["proximo_preco"] / real_results[row[0]]["preco_abertura"])

			cur.close()
			answer = { "code": 200, "probabilities": probabilities, "real_results": real_results }
		except (Exception, psycopg2.DatabaseError) as error:
			print(error)
			answer = { "code": 500, "message": "Erro ao calcular probabilidades", "error": error }
		finally:
			if conn is not None:
				conn.close()

		end = time.time()
		print(f"Time elapsed: {(end - start) * 1000} ms")
		return answer

api.add_resource(Probabilities, '/probabilities/<date>/<investment>')

if __name__ == '__main__':
	app.run(port = '5000')
