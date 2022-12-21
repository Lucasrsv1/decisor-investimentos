SELECT
	AVG(qtd_dias) AS avg_qtd_dias,
	AVG(fator_acumulado) AS avg_fator_acumulado,
	MIN(rendimento_bruto) AS min_rendimento_bruto,
	AVG(rendimento_bruto) AS avg_rendimento_bruto,
	MAX(rendimento_bruto) AS max_rendimento_bruto
FROM (
	SELECT
		TO_CHAR(data, 'YYYY-MM') AS agrupamento,
		COUNT(*) AS qtd_dias,
		EXP(SUM(LN(resultado_total))) AS fator_acumulado,
		ROUND((EXP(SUM(LN(resultado_total))) - 1) * 100, 2) AS rendimento_bruto
	FROM simulacao_top_3
	-- WHERE data >= '2022-01-01'
	GROUP BY 1
	ORDER BY 1 ASC
) S;
