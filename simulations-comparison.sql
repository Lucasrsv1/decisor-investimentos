SELECT
	*,
	(S.dias_prejuizo::FLOAT / S.total_dias * 100) AS percentual_dias_prejuizo,
	(S.dias_lucro::FLOAT / S.total_dias * 100) AS percentual_dias_lucro,
	(S.dias_lucro::FLOAT / S.dias_prejuizo) AS dias_de_lucro_por_dia_de_prejuizo
FROM (
	SELECT
		'simulacao_top_3' AS tabela,
		MIN(resultado_total) AS maior_prejuizo,
		AVG(resultado_total) AS resultado_medio,
		MAX(resultado_total) AS maior_lucro,
		AVG(volume_medio_1) AS media_volume_medio_1,
		AVG(volume_medio_2) AS media_volume_medio_2,
		AVG(volume_medio_3) AS media_volume_medio_3,
		COUNT(*) AS total_dias,
		SUM(CASE WHEN resultado_total <= 1 THEN 1 ELSE 0 END) AS dias_prejuizo,
		SUM(CASE WHEN resultado_total > 1 THEN 1 ELSE 0 END) AS dias_lucro,
		SUM((100 * resultado_total) - 100) AS retorno_investimento
	FROM simulacao_top_3
	UNION ALL
	SELECT
		'simulacao_top_5' AS tabela,
		MIN(resultado_total) AS maior_prejuizo,
		AVG(resultado_total) AS resultado_medio,
		MAX(resultado_total) AS maior_lucro,
		AVG(volume_medio_1) AS media_volume_medio_1,
		AVG(volume_medio_2) AS media_volume_medio_2,
		AVG(volume_medio_3) AS media_volume_medio_3,
		COUNT(*) AS total_dias,
		SUM(CASE WHEN resultado_total <= 1 THEN 1 ELSE 0 END) AS dias_prejuizo,
		SUM(CASE WHEN resultado_total > 1 THEN 1 ELSE 0 END) AS dias_lucro,
		SUM((100 * resultado_total) - 100) AS retorno_investimento
	FROM simulacao_top_5
	UNION ALL
	SELECT
		'simulacao_top_7' AS tabela,
		MIN(resultado_total) AS maior_prejuizo,
		AVG(resultado_total) AS resultado_medio,
		MAX(resultado_total) AS maior_lucro,
		AVG(volume_medio_1) AS media_volume_medio_1,
		AVG(volume_medio_2) AS media_volume_medio_2,
		AVG(volume_medio_3) AS media_volume_medio_3,
		COUNT(*) AS total_dias,
		SUM(CASE WHEN resultado_total <= 1 THEN 1 ELSE 0 END) AS dias_prejuizo,
		SUM(CASE WHEN resultado_total > 1 THEN 1 ELSE 0 END) AS dias_lucro,
		SUM((100 * resultado_total) - 100) AS retorno_investimento
	FROM simulacao_top_7
	UNION ALL
	SELECT
		'simulacao_top_10' AS tabela,
		MIN(resultado_total) AS maior_prejuizo,
		AVG(resultado_total) AS resultado_medio,
		MAX(resultado_total) AS maior_lucro,
		AVG(volume_medio_1) AS media_volume_medio_1,
		AVG(volume_medio_2) AS media_volume_medio_2,
		AVG(volume_medio_3) AS media_volume_medio_3,
		COUNT(*) AS total_dias,
		SUM(CASE WHEN resultado_total <= 1 THEN 1 ELSE 0 END) AS dias_prejuizo,
		SUM(CASE WHEN resultado_total > 1 THEN 1 ELSE 0 END) AS dias_lucro,
		SUM((100 * resultado_total) - 100) AS retorno_investimento
	FROM simulacao_top_10
) S;
