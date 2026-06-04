import { useState, useMemo, useEffect, useRef } from "react";

const EMBEDDED_DATA = {"pop":{"direction":{"Left":0.4672,"Right":0.3969,"Center":0.1359},"zone":{"Bottom-Left":0.2786,"Bottom-Right":0.213,"Mid-Left":0.1325,"Mid-Right":0.121,"Top-Right":0.0629,"Top-Left":0.0561,"Bottom-Center":0.0473,"Mid-Center":0.0467,"Top-Center":0.0419},"height":{"Low":0.5389,"Mid":0.3002,"High":0.1609}},"players":[{"id":5503,"name":"Lionel Andr\u00e9s Messi Cuccittini","pens":82,"goals":66,"rate":0.805,"foot":"Left Foot","dir":{"Left":0.311,"Center":0.146,"Right":0.543},"zone":{"Bottom-Center":0.06,"Bottom-Left":0.174,"Bottom-Right":0.243,"Mid-Center":0.025,"Mid-Left":0.111,"Mid-Right":0.169,"Top-Center":0.06,"Top-Left":0.025,"Top-Right":0.132},"height":{"Low":0.478,"Mid":0.305,"High":0.217},"top_dir":"Right","top_zone":"Bottom-Right","conf":1.0,"shots":[{"y":43.3,"z":0.2,"o":1,"so":false,"comp":"La Liga","vs":"Sevilla"},{"y":41.8,"z":1.5,"o":1,"so":false,"comp":"La Liga","vs":"Almer\u00eda"},{"y":37.4,"z":0.2,"o":1,"so":false,"comp":"La Liga","vs":"Recreativo Huelva"},{"y":41.8,"z":0.2,"o":1,"so":false,"comp":"La Liga","vs":"Valencia"},{"y":37.2,"z":0.2,"o":1,"so":false,"comp":"La Liga","vs":"Racing Santander"},{"y":42.5,"z":0.0,"o":1,"so":false,"comp":"La Liga","vs":"Espanyol"},{"y":37.3,"z":1.5,"o":1,"so":false,"comp":"La Liga","vs":"Athletic Club"},{"y":37.9,"z":0.2,"o":0,"so":false,"comp":"La Liga","vs":"Recreativo Huelva"},{"y":44.0,"z":0.4,"o":1,"so":false,"comp":"La Liga","vs":"Mallorca"},{"y":43.5,"z":0.0,"o":1,"so":false,"comp":"La Liga","vs":"Osasuna"},{"y":43.4,"z":0.1,"o":1,"so":false,"comp":"La Liga","vs":"Racing Santander"},{"y":42.1,"z":0.8,"o":1,"so":false,"comp":"La Liga","vs":"Almer\u00eda"},{"y":41.7,"z":1.3,"o":1,"so":false,"comp":"La Liga","vs":"Real Madrid"},{"y":43.3,"z":0.9,"o":0,"so":false,"comp":"La Liga","vs":"Sevilla"},{"y":42.9,"z":2.3,"o":1,"so":false,"comp":"La Liga","vs":"Mallorca"}],"teams":["Argentina","Barcelona"],"comps":["FIFA World Cup","Copa America","La Liga"],"so_n":3,"so_rate":0.667,"ig_rate":0.81,"last5":"4/5","streak":1,"streak_t":"missed","pred":0.315,"cross":0.543,"natural":0.311,"gk_d":"Right","gk_c":"HIGH","first":"2007-09-22","last":"2024-07-05"},{"id":5207,"name":"Cristiano Ronaldo dos Santos Aveiro","pens":23,"goals":18,"rate":0.783,"foot":"Right Foot","dir":{"Left":0.362,"Center":0.131,"Right":0.507},"zone":{"Bottom-Center":0.005,"Bottom-Left":0.301,"Bottom-Right":0.217,"Mid-Center":0.044,"Mid-Left":0.054,"Mid-Right":0.245,"Top-Center":0.082,"Top-Left":0.006,"Top-Right":0.046},"height":{"Low":0.524,"Mid":0.342,"High":0.134},"top_dir":"Right","top_zone":"Bottom-Left","conf":1.0,"shots":[{"y":43.2,"z":0.9,"o":1,"so":false,"comp":"La Liga","vs":"Barcelona"},{"y":36.4,"z":0.3,"o":1,"so":false,"comp":"La Liga","vs":"Barcelona"},{"y":42.4,"z":1.5,"o":1,"so":false,"comp":"Champions League","vs":"Atl\u00e9tico Madrid"},{"y":43.0,"z":0.4,"o":1,"so":false,"comp":"La Liga","vs":"Barcelona"},{"y":43.3,"z":0.3,"o":1,"so":false,"comp":"La Liga","vs":"Espanyol"},{"y":41.7,"z":0.2,"o":1,"so":false,"comp":"La Liga","vs":"Eibar"},{"y":36.6,"z":0.5,"o":1,"so":false,"comp":"La Liga","vs":"Rayo Vallecano"},{"y":41.5,"z":5.3,"o":0,"so":false,"comp":"La Liga","vs":"Real Sociedad"},{"y":43.8,"z":0.7,"o":1,"so":false,"comp":"La Liga","vs":"Real Sociedad"},{"y":36.8,"z":0.5,"o":1,"so":false,"comp":"La Liga","vs":"Espanyol"},{"y":42.4,"z":0.3,"o":0,"so":false,"comp":"La Liga","vs":"M\u00e1laga"},{"y":36.5,"z":0.0,"o":1,"so":false,"comp":"La Liga","vs":"Levante UD"},{"y":40.5,"z":3.8,"o":0,"so":false,"comp":"La Liga","vs":"Sevilla"},{"y":42.6,"z":1.8,"o":1,"so":true,"comp":"Champions League","vs":"Atl\u00e9tico Madrid"},{"y":43.8,"z":1.3,"o":1,"so":false,"comp":"FIFA World Cup","vs":"Spain"}],"teams":["Real Madrid","Portugal"],"comps":["UEFA Euro","Champions League","La Liga","FIFA World Cup"],"so_n":3,"so_rate":1.0,"ig_rate":0.75,"last5":"4/5","streak":2,"streak_t":"scored","pred":0.261,"cross":0.362,"natural":0.507,"gk_d":"Right","gk_c":"HIGH","first":"2011-04-16","last":"2024-07-05"},{"id":25879,"name":"Ronaldo de Assis Moreira","pens":16,"goals":13,"rate":0.812,"foot":"Right Foot","dir":{"Left":0.495,"Center":0.074,"Right":0.431},"zone":{"Bottom-Center":0.06,"Bottom-Left":0.255,"Bottom-Right":0.349,"Mid-Center":0.007,"Mid-Left":0.074,"Mid-Right":0.072,"Top-Center":0.007,"Top-Left":0.167,"Top-Right":0.01},"height":{"Low":0.664,"Mid":0.153,"High":0.183},"top_dir":"Left","top_zone":"Bottom-Right","conf":1.0,"shots":[{"y":36.5,"z":0.6,"o":1,"so":false,"comp":"La Liga","vs":"Osasuna"},{"y":36.9,"z":0.4,"o":1,"so":false,"comp":"La Liga","vs":"Real Zaragoza"},{"y":36.4,"z":2.4,"o":1,"so":false,"comp":"La Liga","vs":"M\u00e1laga"},{"y":38.1,"z":0.4,"o":0,"so":false,"comp":"La Liga","vs":"Racing Santander"},{"y":36.7,"z":2.0,"o":1,"so":false,"comp":"La Liga","vs":"Racing Santander"},{"y":42.5,"z":0.3,"o":1,"so":false,"comp":"La Liga","vs":"Athletic Club"},{"y":35.5,"z":1.7,"o":0,"so":false,"comp":"La Liga","vs":"Deportivo Alav\u00e9s"},{"y":43.3,"z":0.3,"o":1,"so":false,"comp":"La Liga","vs":"Real Zaragoza"},{"y":43.6,"z":0.6,"o":1,"so":false,"comp":"La Liga","vs":"Racing Santander"},{"y":43.6,"z":0.3,"o":1,"so":false,"comp":"La Liga","vs":"Sevilla"},{"y":43.5,"z":0.2,"o":1,"so":false,"comp":"La Liga","vs":"RC Deportivo La Coru\u00f1a"},{"y":38.7,"z":0.6,"o":0,"so":false,"comp":"La Liga","vs":"Sevilla"},{"y":37.5,"z":2.3,"o":1,"so":false,"comp":"La Liga","vs":"Real Betis"},{"y":36.4,"z":0.1,"o":1,"so":false,"comp":"La Liga","vs":"Athletic Club"},{"y":43.5,"z":0.2,"o":1,"so":false,"comp":"La Liga","vs":"RC Deportivo La Coru\u00f1a"}],"teams":["Barcelona"],"comps":["La Liga"],"so_n":0,"so_rate":null,"ig_rate":0.812,"last5":"4/5","streak":4,"streak_t":"scored","pred":0.243,"cross":0.495,"natural":0.431,"gk_d":"Left","gk_c":"MEDIUM","first":"2004-10-24","last":"2008-02-16"},{"id":4320,"name":"Neymar da Silva Santos Junior","pens":15,"goals":12,"rate":0.8,"foot":"Right Foot","dir":{"Left":0.467,"Center":0.134,"Right":0.4},"zone":{"Bottom-Center":0.063,"Bottom-Left":0.38,"Bottom-Right":0.313,"Mid-Center":0.008,"Mid-Left":0.078,"Mid-Right":0.02,"Top-Center":0.062,"Top-Left":0.009,"Top-Right":0.066},"height":{"Low":0.756,"Mid":0.106,"High":0.138},"top_dir":"Left","top_zone":"Bottom-Left","conf":1.0,"shots":[{"y":42.5,"z":0.0,"o":1,"so":false,"comp":"La Liga","vs":"C\u00f3rdoba CF"},{"y":40.2,"z":3.8,"o":0,"so":false,"comp":"La Liga","vs":"Las Palmas"},{"y":36.9,"z":0.2,"o":1,"so":false,"comp":"La Liga","vs":"Sevilla"},{"y":37.5,"z":0.0,"o":1,"so":false,"comp":"La Liga","vs":"Rayo Vallecano"},{"y":42.6,"z":0.1,"o":1,"so":false,"comp":"La Liga","vs":"Rayo Vallecano"},{"y":42.5,"z":3.0,"o":0,"so":false,"comp":"La Liga","vs":"Real Betis"},{"y":37.5,"z":1.0,"o":1,"so":false,"comp":"La Liga","vs":"Villarreal"},{"y":38.6,"z":0.4,"o":1,"so":false,"comp":"La Liga","vs":"Sporting Gij\u00f3n"},{"y":41.9,"z":0.2,"o":1,"so":false,"comp":"Ligue 1","vs":"Lyon"},{"y":41.9,"z":0.1,"o":0,"so":false,"comp":"Ligue 1","vs":"Nantes"},{"y":36.6,"z":0.6,"o":1,"so":false,"comp":"Ligue 1","vs":"Clermont Foot"},{"y":37.4,"z":0.3,"o":1,"so":false,"comp":"Ligue 1","vs":"Troyes"},{"y":37.3,"z":0.2,"o":1,"so":false,"comp":"Ligue 1","vs":"Montpellier"},{"y":36.9,"z":0.5,"o":1,"so":false,"comp":"Ligue 1","vs":"AS Monaco"},{"y":42.3,"z":0.2,"o":1,"so":false,"comp":"FIFA World Cup","vs":"South Korea"}],"teams":["Brazil","Paris Saint-Germain","Barcelona"],"comps":["Ligue 1","La Liga","FIFA World Cup"],"so_n":0,"so_rate":null,"ig_rate":0.8,"last5":"5/5","streak":5,"streak_t":"scored","pred":0.201,"cross":0.467,"natural":0.4,"gk_d":"Left","gk_c":"MEDIUM","first":"2015-05-02","last":"2022-12-05"},{"id":10955,"name":"Harry Kane","pens":14,"goals":12,"rate":0.857,"foot":"Right Foot","dir":{"Left":0.494,"Center":0.201,"Right":0.305},"zone":{"Bottom-Center":0.008,"Bottom-Left":0.226,"Bottom-Right":0.214,"Mid-Center":0.126,"Mid-Left":0.2,"Mid-Right":0.08,"Top-Center":0.066,"Top-Left":0.069,"Top-Right":0.011},"height":{"Low":0.448,"Mid":0.406,"High":0.146},"top_dir":"Left","top_zone":"Bottom-Left","conf":1.0,"shots":[{"y":42.5,"z":0.2,"o":1,"so":false,"comp":"Premier League","vs":"AFC Bournemouth"},{"y":39.4,"z":1.5,"o":1,"so":false,"comp":"Premier League","vs":"Norwich City"},{"y":36.4,"z":0.2,"o":1,"so":false,"comp":"Premier League","vs":"Sunderland"},{"y":42.6,"z":0.3,"o":1,"so":false,"comp":"Premier League","vs":"Norwich City"},{"y":42.1,"z":1.4,"o":1,"so":false,"comp":"Premier League","vs":"Manchester City"},{"y":36.6,"z":2.0,"o":1,"so":false,"comp":"FIFA World Cup","vs":"Panama"},{"y":37.8,"z":1.6,"o":1,"so":false,"comp":"FIFA World Cup","vs":"Panama"},{"y":40.3,"z":1.6,"o":1,"so":false,"comp":"FIFA World Cup","vs":"Colombia"},{"y":36.2,"z":0.5,"o":1,"so":true,"comp":"FIFA World Cup","vs":"Colombia"},{"y":42.7,"z":0.3,"o":0,"so":false,"comp":"UEFA Euro","vs":"Denmark"},{"y":36.6,"z":0.9,"o":1,"so":true,"comp":"UEFA Euro","vs":"Italy"},{"y":36.4,"z":1.7,"o":1,"so":false,"comp":"FIFA World Cup","vs":"France"},{"y":38.7,"z":4.2,"o":0,"so":false,"comp":"FIFA World Cup","vs":"France"},{"y":36.5,"z":0.2,"o":1,"so":false,"comp":"UEFA Euro","vs":"Netherlands"}],"teams":["England","Tottenham Hotspur"],"comps":["UEFA Euro","FIFA World Cup","Premier League"],"so_n":2,"so_rate":1.0,"ig_rate":0.833,"last5":"3/5","streak":1,"streak_t":"scored","pred":0.241,"cross":0.494,"natural":0.305,"gk_d":"Left","gk_c":"MEDIUM","first":"2015-10-25","last":"2024-07-10"},{"id":3009,"name":"Kylian Mbapp\u00e9 Lottin","pens":12,"goals":9,"rate":0.75,"foot":"Right Foot","dir":{"Left":0.56,"Center":0.027,"Right":0.413},"zone":{"Bottom-Center":0.009,"Bottom-Left":0.256,"Bottom-Right":0.176,"Mid-Center":0.009,"Mid-Left":0.227,"Mid-Right":0.224,"Top-Center":0.008,"Top-Left":0.078,"Top-Right":0.013},"height":{"Low":0.441,"Mid":0.46,"High":0.099},"top_dir":"Left","top_zone":"Bottom-Left","conf":1.0,"shots":[{"y":37.6,"z":1.6,"o":0,"so":true,"comp":"UEFA Euro","vs":"Switzerland"},{"y":37.0,"z":0.4,"o":1,"so":false,"comp":"Ligue 1","vs":"AS Monaco"},{"y":36.7,"z":0.8,"o":1,"so":false,"comp":"Ligue 1","vs":"Olympique de Marseille"},{"y":43.7,"z":0.2,"o":1,"so":false,"comp":"Ligue 1","vs":"Montpellier"},{"y":43.2,"z":1.3,"o":0,"so":false,"comp":"Ligue 1","vs":"Montpellier"},{"y":36.7,"z":2.3,"o":1,"so":false,"comp":"Ligue 1","vs":"Troyes"},{"y":37.3,"z":0.3,"o":1,"so":false,"comp":"FIFA World Cup","vs":"Argentina"},{"y":36.7,"z":1.1,"o":1,"so":false,"comp":"FIFA World Cup","vs":"Argentina"},{"y":37.6,"z":1.3,"o":1,"so":true,"comp":"FIFA World Cup","vs":"Argentina"},{"y":42.1,"z":1.2,"o":0,"so":false,"comp":"Ligue 1","vs":"Montpellier"},{"y":42.7,"z":1.3,"o":1,"so":false,"comp":"Ligue 1","vs":"Clermont Foot"},{"y":43.0,"z":0.8,"o":1,"so":false,"comp":"UEFA Euro","vs":"Poland"}],"teams":["Paris Saint-Germain","France"],"comps":["Ligue 1","FIFA World Cup","UEFA Euro"],"so_n":2,"so_rate":0.5,"ig_rate":0.8,"last5":"4/5","streak":2,"streak_t":"scored","pred":0.34,"cross":0.56,"natural":0.413,"gk_d":"Left","gk_c":"HIGH","first":"2021-06-28","last":"2024-06-25"},{"id":5246,"name":"Luis Alberto Su\u00e1rez D\u00edaz","pens":10,"goals":8,"rate":0.8,"foot":"Right Foot","dir":{"Left":0.415,"Center":0.185,"Right":0.399},"zone":{"Bottom-Center":0.011,"Bottom-Left":0.218,"Bottom-Right":0.126,"Mid-Center":0.088,"Mid-Left":0.184,"Mid-Right":0.259,"Top-Center":0.087,"Top-Left":0.013,"Top-Right":0.015},"height":{"Low":0.355,"Mid":0.531,"High":0.114},"top_dir":"Left","top_zone":"Mid-Right","conf":1.0,"shots":[{"y":36.8,"z":0.3,"o":1,"so":false,"comp":"La Liga","vs":"Villarreal"},{"y":37.1,"z":0.9,"o":0,"so":false,"comp":"La Liga","vs":"Sporting Gij\u00f3n"},{"y":38.8,"z":0.9,"o":0,"so":false,"comp":"La Liga","vs":"Rayo Vallecano"},{"y":43.2,"z":1.5,"o":1,"so":false,"comp":"La Liga","vs":"Sporting Gij\u00f3n"},{"y":39.3,"z":2.0,"o":1,"so":false,"comp":"La Liga","vs":"Sporting Gij\u00f3n"},{"y":43.1,"z":0.3,"o":1,"so":false,"comp":"La Liga","vs":"Huesca"},{"y":37.2,"z":0.2,"o":1,"so":false,"comp":"La Liga","vs":"Sevilla"},{"y":43.7,"z":1.1,"o":1,"so":false,"comp":"La Liga","vs":"Deportivo Alav\u00e9s"},{"y":37.9,"z":1.2,"o":1,"so":false,"comp":"La Liga","vs":"Deportivo Alav\u00e9s"},{"y":43.6,"z":1.6,"o":1,"so":true,"comp":"Copa America","vs":"Canada"}],"teams":["Uruguay","Barcelona"],"comps":["Copa America","La Liga"],"so_n":1,"so_rate":1.0,"ig_rate":0.778,"last5":"5/5","streak":7,"streak_t":"scored","pred":0.123,"cross":0.415,"natural":0.399,"gk_d":"Left","gk_c":"MEDIUM","first":"2015-11-08","last":"2024-07-14"},{"id":15616,"name":"Kim Little","pens":10,"goals":7,"rate":0.7,"foot":"Right Foot","dir":{"Left":0.492,"Center":0.031,"Right":0.476},"zone":{"Bottom-Center":0.011,"Bottom-Left":0.295,"Bottom-Right":0.357,"Mid-Center":0.011,"Mid-Left":0.184,"Mid-Right":0.028,"Top-Center":0.01,"Top-Left":0.013,"Top-Right":0.091},"height":{"Low":0.663,"Mid":0.223,"High":0.114},"top_dir":"Left","top_zone":"Bottom-Right","conf":1.0,"shots":[{"y":36.4,"z":1.6,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Chelsea FCW"},{"y":42.8,"z":0.7,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Reading WFC"},{"y":36.4,"z":1.3,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Yeovil Town LFC"},{"y":42.8,"z":0.4,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Everton LFC"},{"y":42.9,"z":0.4,"o":0,"so":false,"comp":"FA Women's Super Leagu","vs":"Birmingham City WFC"},{"y":37.0,"z":0.3,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Birmingham City WFC"},{"y":43.2,"z":2.2,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Everton LFC"},{"y":43.2,"z":0.5,"o":0,"so":false,"comp":"FA Women's Super Leagu","vs":"Manchester City WFC"},{"y":37.6,"z":0.3,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Manchester United W"},{"y":36.0,"z":0.2,"o":0,"so":false,"comp":"FA Women's Super Leagu","vs":"Brighton & Hove Albion"}],"teams":["Arsenal WFC"],"comps":["FA Women's Super League"],"so_n":0,"so_rate":null,"ig_rate":0.7,"last5":"3/5","streak":1,"streak_t":"missed","pred":0.238,"cross":0.492,"natural":0.476,"gk_d":"Left","gk_c":"MEDIUM","first":"2018-10-14","last":"2024-05-18"},{"id":5487,"name":"Antoine Griezmann","pens":9,"goals":6,"rate":0.667,"foot":"Left Foot","dir":{"Left":0.45,"Center":0.117,"Right":0.433},"zone":{"Bottom-Center":0.012,"Bottom-Left":0.32,"Bottom-Right":0.303,"Mid-Center":0.012,"Mid-Left":0.117,"Mid-Right":0.114,"Top-Center":0.094,"Top-Left":0.014,"Top-Right":0.016},"height":{"Low":0.635,"Mid":0.242,"High":0.124},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.9,"shots":[{"y":41.7,"z":0.8,"o":0,"so":false,"comp":"La Liga","vs":"Real Madrid"},{"y":43.3,"z":0.3,"o":1,"so":false,"comp":"La Liga","vs":"Real Sociedad"},{"y":40.3,"z":2.7,"o":0,"so":false,"comp":"Champions League","vs":"Real Madrid"},{"y":38.0,"z":0.3,"o":1,"so":true,"comp":"Champions League","vs":"Real Madrid"},{"y":43.8,"z":1.4,"o":1,"so":false,"comp":"FIFA World Cup","vs":"Australia"},{"y":38.3,"z":0.2,"o":1,"so":false,"comp":"FIFA World Cup","vs":"Argentina"},{"y":37.6,"z":0.1,"o":1,"so":false,"comp":"FIFA World Cup","vs":"Croatia"},{"y":37.9,"z":0.9,"o":0,"so":false,"comp":"La Liga","vs":"Real Betis"},{"y":43.3,"z":0.8,"o":1,"so":false,"comp":"La Liga","vs":"Getafe"}],"teams":["Atl\u00e9tico Madrid","France","Barcelona"],"comps":["Champions League","La Liga","FIFA World Cup"],"so_n":1,"so_rate":1.0,"ig_rate":0.625,"last5":"4/5","streak":1,"streak_t":"scored","pred":0.175,"cross":0.433,"natural":0.45,"gk_d":"Left","gk_c":"MEDIUM","first":"2015-10-04","last":"2021-04-22"},{"id":7139,"name":"Josip Ili\u010di\u0107","pens":8,"goals":7,"rate":0.875,"foot":"Left Foot","dir":{"Left":0.309,"Center":0.037,"Right":0.654},"zone":{"Bottom-Center":0.013,"Bottom-Left":0.167,"Bottom-Right":0.24,"Mid-Center":0.013,"Mid-Left":0.036,"Mid-Right":0.306,"Top-Center":0.011,"Top-Left":0.106,"Top-Right":0.108},"height":{"Low":0.42,"Mid":0.355,"High":0.226},"top_dir":"Right","top_zone":"Mid-Right","conf":0.8,"shots":[{"y":43.7,"z":0.6,"o":1,"so":false,"comp":"Serie A","vs":"AC Milan"},{"y":43.0,"z":2.0,"o":1,"so":false,"comp":"Serie A","vs":"Inter Milan"},{"y":36.7,"z":0.6,"o":1,"so":false,"comp":"Serie A","vs":"Atalanta"},{"y":43.2,"z":0.3,"o":1,"so":false,"comp":"Serie A","vs":"Sampdoria"},{"y":36.4,"z":2.1,"o":1,"so":false,"comp":"Serie A","vs":"Udinese"},{"y":43.3,"z":1.6,"o":1,"so":false,"comp":"Serie A","vs":"Juventus"},{"y":43.5,"z":1.2,"o":1,"so":false,"comp":"Serie A","vs":"AS Roma"},{"y":42.8,"z":1.4,"o":0,"so":true,"comp":"UEFA Euro","vs":"Portugal"}],"teams":["Fiorentina","Slovenia"],"comps":["Serie A","UEFA Euro"],"so_n":1,"so_rate":0.0,"ig_rate":1.0,"last5":"4/5","streak":1,"streak_t":"missed","pred":0.481,"cross":0.654,"natural":0.309,"gk_d":"Right","gk_c":"HIGH","first":"2015-08-23","last":"2024-07-01"},{"id":7776,"name":"Antonio Candreva","pens":8,"goals":6,"rate":0.75,"foot":"Right Foot","dir":{"Left":0.764,"Center":0.037,"Right":0.199},"zone":{"Bottom-Center":0.013,"Bottom-Left":0.53,"Bottom-Right":0.149,"Mid-Center":0.013,"Mid-Left":0.127,"Mid-Right":0.033,"Top-Center":0.011,"Top-Left":0.106,"Top-Right":0.017},"height":{"Low":0.692,"Mid":0.173,"High":0.135},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.8,"shots":[{"y":36.9,"z":0.2,"o":1,"so":false,"comp":"Serie A","vs":"Palermo"},{"y":37.5,"z":0.5,"o":0,"so":false,"comp":"Serie A","vs":"Inter Milan"},{"y":37.6,"z":1.2,"o":1,"so":false,"comp":"Serie A","vs":"Bologna"},{"y":37.1,"z":0.1,"o":1,"so":false,"comp":"Serie A","vs":"Chievo"},{"y":36.5,"z":0.7,"o":1,"so":false,"comp":"Serie A","vs":"Hellas Verona"},{"y":43.3,"z":0.5,"o":1,"so":false,"comp":"Serie A","vs":"Empoli"},{"y":38.2,"z":0.8,"o":0,"so":false,"comp":"Serie A","vs":"Sampdoria"},{"y":37.2,"z":2.0,"o":1,"so":false,"comp":"Serie A","vs":"Inter Milan"}],"teams":["Lazio"],"comps":["Serie A"],"so_n":0,"so_rate":null,"ig_rate":0.75,"last5":"4/5","streak":1,"streak_t":"scored","pred":0.646,"cross":0.764,"natural":0.199,"gk_d":"Left","gk_c":"HIGH","first":"2015-11-22","last":"2016-05-01"},{"id":10251,"name":"Fara Williams","pens":8,"goals":6,"rate":0.75,"foot":"Right Foot","dir":{"Left":0.309,"Center":0.128,"Right":0.563},"zone":{"Bottom-Center":0.104,"Bottom-Left":0.076,"Bottom-Right":0.422,"Mid-Center":0.013,"Mid-Left":0.036,"Mid-Right":0.124,"Top-Center":0.011,"Top-Left":0.197,"Top-Right":0.017},"height":{"Low":0.602,"Mid":0.173,"High":0.226},"top_dir":"Right","top_zone":"Bottom-Right","conf":0.8,"shots":[{"y":43.6,"z":0.3,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"West Ham United LFC"},{"y":43.6,"z":0.8,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Manchester City WFC"},{"y":43.0,"z":0.6,"o":0,"so":false,"comp":"FA Women's Super Leagu","vs":"Bristol City WFC"},{"y":37.1,"z":1.8,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Everton LFC"},{"y":38.6,"z":0.4,"o":0,"so":false,"comp":"FA Women's Super Leagu","vs":"Manchester United W"},{"y":37.2,"z":2.2,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Manchester United W"},{"y":43.5,"z":0.9,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Aston Villa W"},{"y":42.7,"z":0.1,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Brighton & Hove Albion"}],"teams":["Reading WFC"],"comps":["FA Women's Super League"],"so_n":0,"so_rate":null,"ig_rate":0.75,"last5":"4/5","streak":3,"streak_t":"scored","pred":0.345,"cross":0.309,"natural":0.563,"gk_d":"Right","gk_c":"HIGH","first":"2019-02-20","last":"2021-05-02"},{"id":15570,"name":"Chloe Kelly","pens":8,"goals":6,"rate":0.75,"foot":"Right Foot","dir":{"Left":0.491,"Center":0.128,"Right":0.381},"zone":{"Bottom-Center":0.013,"Bottom-Left":0.167,"Bottom-Right":0.149,"Mid-Center":0.104,"Mid-Left":0.218,"Mid-Right":0.124,"Top-Center":0.011,"Top-Left":0.106,"Top-Right":0.108},"height":{"Low":0.329,"Mid":0.446,"High":0.226},"top_dir":"Left","top_zone":"Mid-Left","conf":0.8,"shots":[{"y":38.3,"z":0.9,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Tottenham Hotspur Wome"},{"y":42.6,"z":2.1,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Chelsea FCW"},{"y":36.6,"z":2.1,"o":1,"so":true,"comp":"Women's World Cup","vs":"Nigeria Women's"},{"y":37.4,"z":1.1,"o":0,"so":false,"comp":"FA Women's Super Leagu","vs":"West Ham United LFC"},{"y":42.2,"z":0.2,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Liverpool WFC"},{"y":43.1,"z":1.6,"o":1,"so":true,"comp":"UEFA Women's Euro","vs":"Sweden Women's"},{"y":37.0,"z":0.8,"o":0,"so":false,"comp":"UEFA Women's Euro","vs":"Italy Women's"},{"y":38.4,"z":1.6,"o":1,"so":true,"comp":"UEFA Women's Euro","vs":"Spain Women's"}],"teams":["England Women's","Manchester City WFC"],"comps":["UEFA Women's Euro","FA Women's Super League","Women's World Cup"],"so_n":3,"so_rate":1.0,"ig_rate":0.6,"last5":"3/5","streak":1,"streak_t":"scored","pred":0.237,"cross":0.491,"natural":0.381,"gk_d":"Left","gk_c":"MEDIUM","first":"2020-10-04","last":"2025-07-27"},{"id":3454,"name":"Troy Deeney","pens":7,"goals":6,"rate":0.857,"foot":"Right Foot","dir":{"Left":0.44,"Center":0.141,"Right":0.419},"zone":{"Bottom-Center":0.114,"Bottom-Left":0.284,"Bottom-Right":0.264,"Mid-Center":0.014,"Mid-Left":0.04,"Mid-Right":0.136,"Top-Center":0.013,"Top-Left":0.117,"Top-Right":0.019},"height":{"Low":0.662,"Mid":0.19,"High":0.148},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.7,"shots":[{"y":37.8,"z":0.2,"o":1,"so":false,"comp":"Premier League","vs":"Leicester City"},{"y":38.2,"z":2.0,"o":1,"so":false,"comp":"Premier League","vs":"Manchester United"},{"y":42.0,"z":1.3,"o":1,"so":false,"comp":"Premier League","vs":"Norwich City"},{"y":43.1,"z":0.1,"o":1,"so":false,"comp":"Premier League","vs":"Chelsea"},{"y":37.9,"z":0.2,"o":1,"so":false,"comp":"Premier League","vs":"Crystal Palace"},{"y":39.8,"z":0.5,"o":0,"so":false,"comp":"Premier League","vs":"West Ham United"},{"y":42.8,"z":0.8,"o":1,"so":false,"comp":"Premier League","vs":"Sunderland"}],"teams":["Watford"],"comps":["Premier League"],"so_n":0,"so_rate":null,"ig_rate":0.857,"last5":"4/5","streak":1,"streak_t":"scored","pred":0.16,"cross":0.44,"natural":0.419,"gk_d":"Left","gk_c":"MEDIUM","first":"2015-11-07","last":"2016-05-15"},{"id":3672,"name":"Zlatan Ibrahimovi\u0107","pens":7,"goals":6,"rate":0.857,"foot":"Right Foot","dir":{"Left":0.74,"Center":0.041,"Right":0.219},"zone":{"Bottom-Center":0.014,"Bottom-Left":0.584,"Bottom-Right":0.164,"Mid-Center":0.014,"Mid-Left":0.14,"Mid-Right":0.036,"Top-Center":0.013,"Top-Left":0.017,"Top-Right":0.019},"height":{"Low":0.762,"Mid":0.19,"High":0.048},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.7,"shots":[{"y":36.8,"z":0.3,"o":1,"so":false,"comp":"La Liga","vs":"Real Zaragoza"},{"y":37.6,"z":0.2,"o":0,"so":false,"comp":"Ligue 1","vs":"Guingamp"},{"y":38.1,"z":1.1,"o":1,"so":false,"comp":"Ligue 1","vs":"Olympique de Marseille"},{"y":38.0,"z":0.3,"o":1,"so":false,"comp":"Ligue 1","vs":"Olympique de Marseille"},{"y":43.2,"z":0.1,"o":1,"so":false,"comp":"Ligue 1","vs":"Troyes"},{"y":36.9,"z":0.2,"o":1,"so":false,"comp":"Ligue 1","vs":"OGC Nice"},{"y":36.6,"z":0.2,"o":1,"so":false,"comp":"Ligue 1","vs":"Lyon"}],"teams":["Paris Saint-Germain","Barcelona"],"comps":["Ligue 1","La Liga"],"so_n":0,"so_rate":null,"ig_rate":0.857,"last5":"5/5","streak":5,"streak_t":"scored","pred":0.61,"cross":0.74,"natural":0.219,"gk_d":"Left","gk_c":"HIGH","first":"2010-03-21","last":"2015-12-13"},{"id":4654,"name":"Nikita Parris","pens":7,"goals":5,"rate":0.714,"foot":"Right Foot","dir":{"Left":0.74,"Center":0.041,"Right":0.219},"zone":{"Bottom-Center":0.014,"Bottom-Left":0.284,"Bottom-Right":0.064,"Mid-Center":0.014,"Mid-Left":0.24,"Mid-Right":0.136,"Top-Center":0.013,"Top-Left":0.217,"Top-Right":0.019},"height":{"Low":0.362,"Mid":0.39,"High":0.248},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.7,"shots":[{"y":36.4,"z":0.5,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Bristol City WFC"},{"y":36.2,"z":0.8,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Liverpool WFC"},{"y":36.4,"z":1.3,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Brighton & Hove Albion"},{"y":37.1,"z":1.8,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Yeovil Town LFC"},{"y":37.0,"z":2.4,"o":1,"so":false,"comp":"Women's World Cup","vs":"Scotland W"},{"y":42.0,"z":1.2,"o":0,"so":false,"comp":"Women's World Cup","vs":"Argentina Women's"},{"y":37.2,"z":1.3,"o":0,"so":false,"comp":"Women's World Cup","vs":"Norway Women's"}],"teams":["England Women's","Manchester City WFC"],"comps":["FA Women's Super League","Women's World Cup"],"so_n":0,"so_rate":null,"ig_rate":0.714,"last5":"3/5","streak":2,"streak_t":"missed","pred":0.61,"cross":0.74,"natural":0.219,"gk_d":"Left","gk_c":"HIGH","first":"2018-09-23","last":"2019-06-27"},{"id":5082,"name":"Marta Vieira da Silva","pens":7,"goals":6,"rate":0.857,"foot":"Left Foot","dir":{"Left":0.44,"Center":0.141,"Right":0.419},"zone":{"Bottom-Center":0.014,"Bottom-Left":0.284,"Bottom-Right":0.264,"Mid-Center":0.014,"Mid-Left":0.14,"Mid-Right":0.136,"Top-Center":0.113,"Top-Left":0.017,"Top-Right":0.019},"height":{"Low":0.562,"Mid":0.29,"High":0.148},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.7,"shots":[{"y":42.4,"z":1.3,"o":0,"so":false,"comp":"NWSL","vs":"NJ/NY Gotham FC"},{"y":37.2,"z":0.5,"o":1,"so":false,"comp":"Women's World Cup","vs":"Australia Women's"},{"y":43.5,"z":0.3,"o":1,"so":false,"comp":"Women's World Cup","vs":"Italy Women's"},{"y":37.0,"z":0.2,"o":1,"so":false,"comp":"NWSL","vs":"Washington Spirit"},{"y":40.1,"z":2.3,"o":1,"so":false,"comp":"NWSL","vs":"KC Current"},{"y":42.1,"z":0.3,"o":1,"so":false,"comp":"NWSL","vs":"Racing Louisville FC"},{"y":38.0,"z":0.9,"o":1,"so":false,"comp":"NWSL","vs":"Houston Dash"}],"teams":["Brazil Women's","Orlando Pride"],"comps":["NWSL","Women's World Cup"],"so_n":0,"so_rate":null,"ig_rate":0.857,"last5":"5/5","streak":6,"streak_t":"scored","pred":0.16,"cross":0.419,"natural":0.44,"gk_d":"Left","gk_c":"MEDIUM","first":"2018-08-06","last":"2023-10-16"},{"id":5743,"name":"Paulo Bruno Exequiel Dybala","pens":7,"goals":7,"rate":1.0,"foot":"Left Foot","dir":{"Left":0.64,"Center":0.141,"Right":0.219},"zone":{"Bottom-Center":0.114,"Bottom-Left":0.484,"Bottom-Right":0.064,"Mid-Center":0.014,"Mid-Left":0.14,"Mid-Right":0.036,"Top-Center":0.013,"Top-Left":0.017,"Top-Right":0.119},"height":{"Low":0.662,"Mid":0.19,"High":0.148},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.7,"shots":[{"y":42.9,"z":2.0,"o":1,"so":false,"comp":"Serie A","vs":"Chievo"},{"y":37.1,"z":0.3,"o":1,"so":false,"comp":"Serie A","vs":"Bologna"},{"y":37.0,"z":0.2,"o":1,"so":false,"comp":"Serie A","vs":"Udinese"},{"y":36.8,"z":1.1,"o":1,"so":false,"comp":"Serie A","vs":"Lazio"},{"y":37.4,"z":0.7,"o":1,"so":false,"comp":"Serie A","vs":"Hellas Verona"},{"y":36.3,"z":0.2,"o":1,"so":false,"comp":"Serie A","vs":"Sampdoria"},{"y":40.4,"z":0.2,"o":1,"so":true,"comp":"FIFA World Cup","vs":"France"}],"teams":["Juventus","Argentina"],"comps":["Serie A","FIFA World Cup"],"so_n":1,"so_rate":1.0,"ig_rate":1.0,"last5":"5/5","streak":7,"streak_t":"scored","pred":0.46,"cross":0.219,"natural":0.64,"gk_d":"Left","gk_c":"HIGH","first":"2015-09-12","last":"2022-12-18"},{"id":8298,"name":"Megan Anna Rapinoe","pens":7,"goals":6,"rate":0.857,"foot":"Right Foot","dir":{"Left":0.54,"Center":0.041,"Right":0.419},"zone":{"Bottom-Center":0.014,"Bottom-Left":0.384,"Bottom-Right":0.264,"Mid-Center":0.014,"Mid-Left":0.04,"Mid-Right":0.036,"Top-Center":0.013,"Top-Left":0.117,"Top-Right":0.119},"height":{"Low":0.662,"Mid":0.09,"High":0.248},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.7,"shots":[{"y":36.4,"z":2.3,"o":1,"so":false,"comp":"NWSL","vs":"Seattle Reign"},{"y":36.3,"z":0.2,"o":1,"so":false,"comp":"Women's World Cup","vs":"Spain Women's"},{"y":36.3,"z":0.2,"o":1,"so":false,"comp":"Women's World Cup","vs":"Spain Women's"},{"y":43.2,"z":0.2,"o":1,"so":false,"comp":"Women's World Cup","vs":"Netherlands Women's"},{"y":43.1,"z":0.2,"o":1,"so":false,"comp":"NWSL","vs":"Racing Louisville FC"},{"y":43.4,"z":5.0,"o":0,"so":true,"comp":"Women's World Cup","vs":"Sweden Women's"},{"y":37.1,"z":0.5,"o":1,"so":false,"comp":"NWSL","vs":"Angel City"}],"teams":["Seattle Reign","OL Reign","United States Women's"],"comps":["NWSL","Women's World Cup"],"so_n":1,"so_rate":0.0,"ig_rate":1.0,"last5":"4/5","streak":1,"streak_t":"scored","pred":0.31,"cross":0.54,"natural":0.419,"gk_d":"Left","gk_c":"HIGH","first":"2018-07-08","last":"2023-08-28"},{"id":10161,"name":"Mar\u00eda Francesca Caldentey Oliver","pens":7,"goals":5,"rate":0.714,"foot":"Right Foot","dir":{"Left":0.44,"Center":0.141,"Right":0.419},"zone":{"Bottom-Center":0.014,"Bottom-Left":0.284,"Bottom-Right":0.164,"Mid-Center":0.114,"Mid-Left":0.14,"Mid-Right":0.136,"Top-Center":0.013,"Top-Left":0.017,"Top-Right":0.119},"height":{"Low":0.462,"Mid":0.39,"High":0.148},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.7,"shots":[{"y":43.6,"z":2.1,"o":1,"so":false,"comp":"UEFA Women's Euro","vs":"WNT Finland"},{"y":36.2,"z":0.2,"o":1,"so":false,"comp":"Women's World Cup","vs":"Netherlands Women's"},{"y":43.5,"z":0.5,"o":1,"so":false,"comp":"Liga F","vs":"FC Levante Badalona"},{"y":36.7,"z":1.4,"o":1,"so":false,"comp":"Liga F","vs":"Athletic Club Bilbao"},{"y":43.4,"z":1.4,"o":1,"so":false,"comp":"Liga F","vs":"Real Betis Balompi\u00e9"},{"y":35.5,"z":0.2,"o":0,"so":false,"comp":"UEFA Women's Euro","vs":"Switzerland Women's"},{"y":41.4,"z":1.3,"o":0,"so":true,"comp":"UEFA Women's Euro","vs":"England Women's"}],"teams":["Spain Women's","Barcelona WFC"],"comps":["Liga F","UEFA Women's Euro","Women's World Cup"],"so_n":1,"so_rate":0.0,"ig_rate":0.833,"last5":"3/5","streak":2,"streak_t":"missed","pred":0.16,"cross":0.44,"natural":0.419,"gk_d":"Left","gk_c":"MEDIUM","first":"2022-07-08","last":"2025-07-27"},{"id":15516,"name":"Thierry Henry","pens":7,"goals":7,"rate":1.0,"foot":"Right Foot","dir":{"Left":0.34,"Center":0.241,"Right":0.419},"zone":{"Bottom-Center":0.114,"Bottom-Left":0.284,"Bottom-Right":0.264,"Mid-Center":0.114,"Mid-Left":0.04,"Mid-Right":0.136,"Top-Center":0.013,"Top-Left":0.017,"Top-Right":0.019},"height":{"Low":0.662,"Mid":0.29,"High":0.048},"top_dir":"Right","top_zone":"Bottom-Left","conf":0.7,"shots":[{"y":38.1,"z":0.2,"o":1,"so":false,"comp":"Premier League","vs":"Everton"},{"y":41.8,"z":0.7,"o":1,"so":false,"comp":"Premier League","vs":"Portsmouth"},{"y":39.6,"z":0.5,"o":1,"so":false,"comp":"Premier League","vs":"Newcastle United"},{"y":42.6,"z":0.1,"o":1,"so":false,"comp":"Premier League","vs":"Middlesbrough"},{"y":43.1,"z":1.5,"o":1,"so":false,"comp":"Premier League","vs":"Aston Villa"},{"y":40.9,"z":1.7,"o":1,"so":false,"comp":"Premier League","vs":"Leeds United"},{"y":37.4,"z":0.3,"o":1,"so":false,"comp":"Premier League","vs":"Leicester City"}],"teams":["Arsenal"],"comps":["Premier League"],"so_n":0,"so_rate":null,"ig_rate":1.0,"last5":"5/5","streak":7,"streak_t":"scored","pred":0.129,"cross":0.34,"natural":0.419,"gk_d":"Right","gk_c":"MEDIUM","first":"2003-08-16","last":"2004-05-15"},{"id":27109,"name":"Youssef El-Arabi","pens":7,"goals":7,"rate":1.0,"foot":"Right Foot","dir":{"Left":0.34,"Center":0.041,"Right":0.619},"zone":{"Bottom-Center":0.014,"Bottom-Left":0.284,"Bottom-Right":0.364,"Mid-Center":0.014,"Mid-Left":0.04,"Mid-Right":0.236,"Top-Center":0.013,"Top-Left":0.017,"Top-Right":0.019},"height":{"Low":0.662,"Mid":0.29,"High":0.048},"top_dir":"Right","top_zone":"Bottom-Right","conf":0.7,"shots":[{"y":43.5,"z":0.8,"o":1,"so":false,"comp":"La Liga","vs":"Getafe"},{"y":43.6,"z":0.5,"o":1,"so":false,"comp":"La Liga","vs":"RC Deportivo La Coru\u00f1a"},{"y":42.7,"z":1.0,"o":1,"so":false,"comp":"La Liga","vs":"Sporting Gij\u00f3n"},{"y":36.7,"z":0.4,"o":1,"so":false,"comp":"La Liga","vs":"Rayo Vallecano"},{"y":37.0,"z":0.2,"o":1,"so":false,"comp":"La Liga","vs":"Levante UD"},{"y":43.8,"z":1.0,"o":1,"so":false,"comp":"La Liga","vs":"Levante UD"},{"y":42.7,"z":0.7,"o":1,"so":false,"comp":"La Liga","vs":"Sevilla"}],"teams":["Granada"],"comps":["La Liga"],"so_n":0,"so_rate":null,"ig_rate":1.0,"last5":"5/5","streak":7,"streak_t":"scored","pred":0.429,"cross":0.34,"natural":0.619,"gk_d":"Right","gk_c":"HIGH","first":"2015-08-30","last":"2016-05-08"},{"id":3247,"name":"F\u00e1bio Henrique Tavares","pens":6,"goals":6,"rate":1.0,"foot":"Right Foot","dir":{"Left":0.6,"Center":0.156,"Right":0.243},"zone":{"Bottom-Center":0.016,"Bottom-Left":0.426,"Bottom-Right":0.071,"Mid-Center":0.016,"Mid-Left":0.044,"Mid-Right":0.151,"Top-Center":0.125,"Top-Left":0.13,"Top-Right":0.021},"height":{"Low":0.513,"Mid":0.211,"High":0.276},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.6,"shots":[{"y":37.1,"z":0.0,"o":1,"so":false,"comp":"Ligue 1","vs":"Gaz\u00e9lec Ajaccio"},{"y":36.5,"z":0.2,"o":1,"so":false,"comp":"Ligue 1","vs":"Montpellier"},{"y":36.3,"z":2.0,"o":1,"so":false,"comp":"Ligue 1","vs":"Saint-\u00c9tienne"},{"y":36.7,"z":0.5,"o":1,"so":false,"comp":"Ligue 1","vs":"Gaz\u00e9lec Ajaccio"},{"y":40.3,"z":2.0,"o":1,"so":false,"comp":"Ligue 1","vs":"Paris Saint-Germain"},{"y":41.9,"z":0.9,"o":1,"so":false,"comp":"Ligue 1","vs":"Montpellier"}],"teams":["AS Monaco"],"comps":["Ligue 1"],"so_n":0,"so_rate":null,"ig_rate":1.0,"last5":"5/5","streak":6,"streak_t":"scored","pred":0.4,"cross":0.6,"natural":0.243,"gk_d":"Left","gk_c":"MEDIUM","first":"2015-09-13","last":"2016-05-14"},{"id":3814,"name":"Riyad Mahrez","pens":6,"goals":4,"rate":0.667,"foot":"Left Foot","dir":{"Left":0.267,"Center":0.156,"Right":0.577},"zone":{"Bottom-Center":0.016,"Bottom-Left":0.204,"Bottom-Right":0.404,"Mid-Center":0.127,"Mid-Left":0.044,"Mid-Right":0.151,"Top-Center":0.014,"Top-Left":0.019,"Top-Right":0.021},"height":{"Low":0.624,"Mid":0.322,"High":0.054},"top_dir":"Right","top_zone":"Bottom-Right","conf":0.6,"shots":[{"y":42.8,"z":0.0,"o":1,"so":false,"comp":"Premier League","vs":"Sunderland"},{"y":43.5,"z":0.0,"o":1,"so":false,"comp":"Premier League","vs":"Stoke City"},{"y":36.3,"z":0.2,"o":1,"so":false,"comp":"Premier League","vs":"Everton"},{"y":43.0,"z":0.2,"o":1,"so":false,"comp":"Premier League","vs":"Everton"},{"y":43.0,"z":0.9,"o":0,"so":false,"comp":"Premier League","vs":"AFC Bournemouth"},{"y":38.4,"z":1.0,"o":0,"so":false,"comp":"Premier League","vs":"Aston Villa"}],"teams":["Leicester City"],"comps":["Premier League"],"so_n":0,"so_rate":null,"ig_rate":0.667,"last5":"3/5","streak":2,"streak_t":"missed","pred":0.366,"cross":0.577,"natural":0.267,"gk_d":"Right","gk_c":"MEDIUM","first":"2015-08-08","last":"2016-01-16"},{"id":4643,"name":"Georgia Stanway","pens":6,"goals":4,"rate":0.667,"foot":"Right Foot","dir":{"Left":0.711,"Center":0.156,"Right":0.132},"zone":{"Bottom-Center":0.127,"Bottom-Left":0.426,"Bottom-Right":0.071,"Mid-Center":0.016,"Mid-Left":0.155,"Mid-Right":0.04,"Top-Center":0.014,"Top-Left":0.13,"Top-Right":0.021},"height":{"Low":0.624,"Mid":0.211,"High":0.165},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.6,"shots":[{"y":38.5,"z":0.6,"o":0,"so":false,"comp":"FA Women's Super Leagu","vs":"Chelsea FCW"},{"y":37.3,"z":1.9,"o":1,"so":false,"comp":"UEFA Women's Euro","vs":"Norway Women's"},{"y":38.0,"z":0.7,"o":1,"so":false,"comp":"Women's World Cup","vs":"Haiti Women's"},{"y":35.3,"z":1.2,"o":0,"so":true,"comp":"Women's World Cup","vs":"Nigeria Women's"},{"y":36.3,"z":0.2,"o":1,"so":false,"comp":"Frauen Bundesliga","vs":"Duisburg WFC"},{"y":36.7,"z":0.2,"o":1,"so":false,"comp":"UEFA Women's Euro","vs":"Wales W"}],"teams":["Bayern M\u00fcnchen W","England Women's","Manchester City WFC"],"comps":["Frauen Bundesliga","UEFA Women's Euro","FA Women's Super League","Women's World Cup"],"so_n":1,"so_rate":0.0,"ig_rate":0.8,"last5":"4/5","streak":2,"streak_t":"scored","pred":0.567,"cross":0.711,"natural":0.132,"gk_d":"Left","gk_c":"MEDIUM","first":"2020-02-23","last":"2025-07-13"},{"id":5085,"name":"Alexandra Morgan Carrasco","pens":6,"goals":5,"rate":0.833,"foot":"Left Foot","dir":{"Left":0.489,"Center":0.045,"Right":0.466},"zone":{"Bottom-Center":0.016,"Bottom-Left":0.426,"Bottom-Right":0.182,"Mid-Center":0.016,"Mid-Left":0.044,"Mid-Right":0.151,"Top-Center":0.014,"Top-Left":0.019,"Top-Right":0.132},"height":{"Low":0.624,"Mid":0.211,"High":0.165},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.6,"shots":[{"y":43.6,"z":2.2,"o":1,"so":false,"comp":"NWSL","vs":"Utah Royals"},{"y":37.0,"z":0.0,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Brighton & Hove Albion"},{"y":42.9,"z":0.9,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Aston Villa W"},{"y":36.7,"z":0.2,"o":1,"so":false,"comp":"NWSL","vs":"Chicago Red Stars"},{"y":43.6,"z":0.5,"o":1,"so":false,"comp":"NWSL","vs":"North Carolina Courage"},{"y":38.0,"z":0.3,"o":0,"so":false,"comp":"Women's World Cup","vs":"Vietnam Women's"}],"teams":["United States Women's","Orlando Pride","Tottenham Hotspur Women"],"comps":["Women's World Cup","NWSL","FA Women's Super League"],"so_n":0,"so_rate":null,"ig_rate":0.833,"last5":"4/5","streak":1,"streak_t":"missed","pred":0.234,"cross":0.466,"natural":0.489,"gk_d":"Left","gk_c":"MEDIUM","first":"2018-07-15","last":"2023-07-22"},{"id":5463,"name":"Luka Modri\u0107","pens":6,"goals":4,"rate":0.667,"foot":"Right Foot","dir":{"Left":0.489,"Center":0.156,"Right":0.354},"zone":{"Bottom-Center":0.127,"Bottom-Left":0.426,"Bottom-Right":0.293,"Mid-Center":0.016,"Mid-Left":0.044,"Mid-Right":0.04,"Top-Center":0.014,"Top-Left":0.019,"Top-Right":0.021},"height":{"Low":0.846,"Mid":0.1,"High":0.054},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.6,"shots":[{"y":36.2,"z":0.3,"o":1,"so":false,"comp":"FIFA World Cup","vs":"Nigeria"},{"y":43.0,"z":0.2,"o":0,"so":false,"comp":"FIFA World Cup","vs":"Denmark"},{"y":40.3,"z":0.2,"o":1,"so":true,"comp":"FIFA World Cup","vs":"Denmark"},{"y":37.6,"z":0.2,"o":1,"so":true,"comp":"FIFA World Cup","vs":"Russia"},{"y":36.9,"z":0.2,"o":1,"so":true,"comp":"FIFA World Cup","vs":"Brazil"},{"y":42.3,"z":0.2,"o":0,"so":false,"comp":"UEFA Euro","vs":"Italy"}],"teams":["Croatia"],"comps":["FIFA World Cup","UEFA Euro"],"so_n":3,"so_rate":1.0,"ig_rate":0.333,"last5":"3/5","streak":1,"streak_t":"missed","pred":0.234,"cross":0.489,"natural":0.354,"gk_d":"Left","gk_c":"MEDIUM","first":"2018-06-16","last":"2024-06-24"},{"id":7131,"name":"Domenico Berardi","pens":6,"goals":4,"rate":0.667,"foot":"Left Foot","dir":{"Left":0.267,"Center":0.268,"Right":0.466},"zone":{"Bottom-Center":0.016,"Bottom-Left":0.204,"Bottom-Right":0.293,"Mid-Center":0.127,"Mid-Left":0.044,"Mid-Right":0.04,"Top-Center":0.125,"Top-Left":0.019,"Top-Right":0.132},"height":{"Low":0.513,"Mid":0.211,"High":0.276},"top_dir":"Right","top_zone":"Bottom-Right","conf":0.6,"shots":[{"y":43.4,"z":2.4,"o":1,"so":false,"comp":"Serie A","vs":"Lazio"},{"y":43.5,"z":0.3,"o":1,"so":false,"comp":"Serie A","vs":"Inter Milan"},{"y":40.9,"z":3.0,"o":0,"so":false,"comp":"Serie A","vs":"AS Roma"},{"y":41.4,"z":1.2,"o":1,"so":false,"comp":"Serie A","vs":"Lazio"},{"y":43.6,"z":0.3,"o":0,"so":false,"comp":"Serie A","vs":"Sampdoria"},{"y":37.2,"z":0.4,"o":1,"so":true,"comp":"UEFA Euro","vs":"England"}],"teams":["Italy","Sassuolo"],"comps":["Serie A","UEFA Euro"],"so_n":1,"so_rate":1.0,"ig_rate":0.6,"last5":"3/5","streak":1,"streak_t":"scored","pred":0.199,"cross":0.466,"natural":0.267,"gk_d":"Right","gk_c":"MEDIUM","first":"2015-10-18","last":"2021-07-11"},{"id":7471,"name":"Andrea Belotti","pens":6,"goals":5,"rate":0.833,"foot":"Right Foot","dir":{"Left":0.6,"Center":0.045,"Right":0.354},"zone":{"Bottom-Center":0.016,"Bottom-Left":0.537,"Bottom-Right":0.293,"Mid-Center":0.016,"Mid-Left":0.044,"Mid-Right":0.04,"Top-Center":0.014,"Top-Left":0.019,"Top-Right":0.021},"height":{"Low":0.846,"Mid":0.1,"High":0.054},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.6,"shots":[{"y":37.6,"z":0.2,"o":1,"so":false,"comp":"Serie A","vs":"Juventus"},{"y":37.0,"z":0.2,"o":1,"so":false,"comp":"Serie A","vs":"Inter Milan"},{"y":36.5,"z":0.3,"o":1,"so":false,"comp":"Serie A","vs":"Bologna"},{"y":43.2,"z":0.8,"o":1,"so":false,"comp":"Serie A","vs":"AS Roma"},{"y":36.9,"z":0.6,"o":1,"so":true,"comp":"UEFA Euro","vs":"Spain"},{"y":42.1,"z":0.5,"o":0,"so":true,"comp":"UEFA Euro","vs":"England"}],"teams":["Italy","Torino"],"comps":["Serie A","UEFA Euro"],"so_n":2,"so_rate":0.5,"ig_rate":1.0,"last5":"4/5","streak":1,"streak_t":"missed","pred":0.4,"cross":0.6,"natural":0.354,"gk_d":"Left","gk_c":"MEDIUM","first":"2016-03-20","last":"2021-07-11"},{"id":10203,"name":"Cristiana Girelli","pens":6,"goals":5,"rate":0.833,"foot":"Right Foot","dir":{"Left":0.489,"Center":0.156,"Right":0.354},"zone":{"Bottom-Center":0.127,"Bottom-Left":0.426,"Bottom-Right":0.293,"Mid-Center":0.016,"Mid-Left":0.044,"Mid-Right":0.04,"Top-Center":0.014,"Top-Left":0.019,"Top-Right":0.021},"height":{"Low":0.846,"Mid":0.1,"High":0.054},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.6,"shots":[{"y":37.0,"z":0.2,"o":1,"so":false,"comp":"Women's World Cup","vs":"Jamaica Women's"},{"y":36.9,"z":0.5,"o":1,"so":false,"comp":"Serie A Women","vs":"Fiorentina W"},{"y":41.7,"z":0.2,"o":1,"so":false,"comp":"Serie A Women","vs":"FC Internazionale Mila"},{"y":42.4,"z":0.2,"o":1,"so":false,"comp":"Serie A Women","vs":"Napoli W"},{"y":36.0,"z":0.1,"o":0,"so":false,"comp":"Serie A Women","vs":"FC Internazionale Mila"},{"y":40.7,"z":0.0,"o":1,"so":false,"comp":"Serie A Women","vs":"FC Internazionale Mila"}],"teams":["Juventus W","Italy Women's"],"comps":["Women's World Cup","Serie A Women"],"so_n":0,"so_rate":null,"ig_rate":0.833,"last5":"4/5","streak":1,"streak_t":"scored","pred":0.234,"cross":0.489,"natural":0.354,"gk_d":"Left","gk_c":"MEDIUM","first":"2019-06-14","last":"2024-03-17"},{"id":10960,"name":"Jamie Vardy","pens":6,"goals":5,"rate":0.833,"foot":"Right Foot","dir":{"Left":0.378,"Center":0.268,"Right":0.354},"zone":{"Bottom-Center":0.016,"Bottom-Left":0.204,"Bottom-Right":0.071,"Mid-Center":0.016,"Mid-Left":0.155,"Mid-Right":0.151,"Top-Center":0.236,"Top-Left":0.019,"Top-Right":0.132},"height":{"Low":0.291,"Mid":0.322,"High":0.387},"top_dir":"Left","top_zone":"Top-Center","conf":0.6,"shots":[{"y":42.5,"z":2.0,"o":1,"so":false,"comp":"Premier League","vs":"AFC Bournemouth"},{"y":38.2,"z":1.3,"o":1,"so":false,"comp":"Premier League","vs":"Norwich City"},{"y":39.6,"z":2.1,"o":1,"so":false,"comp":"Premier League","vs":"Watford"},{"y":42.0,"z":1.2,"o":1,"so":false,"comp":"Premier League","vs":"Arsenal"},{"y":36.6,"z":0.0,"o":1,"so":false,"comp":"Premier League","vs":"Everton"},{"y":40.1,"z":4.5,"o":0,"so":false,"comp":"Premier League","vs":"Everton"}],"teams":["Leicester City"],"comps":["Premier League"],"so_n":0,"so_rate":null,"ig_rate":0.833,"last5":"4/5","streak":1,"streak_t":"missed","pred":0.067,"cross":0.378,"natural":0.354,"gk_d":"Left","gk_c":"LOW","first":"2015-08-29","last":"2016-05-07"},{"id":3038,"name":"Andy Delort","pens":5,"goals":4,"rate":0.8,"foot":"Right Foot","dir":{"Left":0.55,"Center":0.051,"Right":0.399},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.354,"Bottom-Right":0.205,"Mid-Center":0.018,"Mid-Left":0.05,"Mid-Right":0.045,"Top-Center":0.016,"Top-Left":0.146,"Top-Right":0.149},"height":{"Low":0.577,"Mid":0.113,"High":0.31},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.5,"shots":[{"y":43.7,"z":2.4,"o":1,"so":false,"comp":"Ligue 1","vs":"Lille"},{"y":38.2,"z":0.4,"o":0,"so":false,"comp":"Ligue 1","vs":"Paris Saint-Germain"},{"y":43.7,"z":0.4,"o":1,"so":false,"comp":"Ligue 1","vs":"OGC Nice"},{"y":36.7,"z":0.2,"o":1,"so":false,"comp":"Ligue 1","vs":"Nantes"},{"y":36.5,"z":2.4,"o":1,"so":false,"comp":"Ligue 1","vs":"Bordeaux"}],"teams":["Stade Malherbe Caen","Caen"],"comps":["Ligue 1"],"so_n":0,"so_rate":null,"ig_rate":0.8,"last5":"4/5","streak":3,"streak_t":"scored","pred":0.325,"cross":0.55,"natural":0.399,"gk_d":"Left","gk_c":"MEDIUM","first":"2015-12-05","last":"2016-05-14"},{"id":3185,"name":"Thomas Mangani","pens":5,"goals":3,"rate":0.6,"foot":"Left Foot","dir":{"Left":0.3,"Center":0.301,"Right":0.399},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.23,"Bottom-Right":0.08,"Mid-Center":0.142,"Mid-Left":0.05,"Mid-Right":0.045,"Top-Center":0.141,"Top-Left":0.021,"Top-Right":0.274},"height":{"Low":0.327,"Mid":0.238,"High":0.435},"top_dir":"Right","top_zone":"Top-Right","conf":0.5,"shots":[{"y":43.2,"z":2.3,"o":1,"so":false,"comp":"Ligue 1","vs":"Troyes"},{"y":40.1,"z":2.2,"o":1,"so":false,"comp":"Ligue 1","vs":"Olympique de Marseille"},{"y":37.3,"z":0.0,"o":0,"so":false,"comp":"Ligue 1","vs":"Rennes"},{"y":40.5,"z":1.3,"o":1,"so":false,"comp":"Ligue 1","vs":"Lorient"},{"y":42.8,"z":2.8,"o":0,"so":false,"comp":"Ligue 1","vs":"Bastia"}],"teams":["Angers"],"comps":["Ligue 1"],"so_n":0,"so_rate":null,"ig_rate":0.6,"last5":"3/5","streak":1,"streak_t":"missed","pred":0.099,"cross":0.399,"natural":0.3,"gk_d":"Right","gk_c":"LOW","first":"2015-09-19","last":"2016-05-07"},{"id":3237,"name":"Sergio Leonel Ag\u00fcero del Castillo","pens":5,"goals":4,"rate":0.8,"foot":"Right Foot","dir":{"Left":0.55,"Center":0.051,"Right":0.399},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.354,"Bottom-Right":0.33,"Mid-Center":0.018,"Mid-Left":0.175,"Mid-Right":0.045,"Top-Center":0.016,"Top-Left":0.021,"Top-Right":0.024},"height":{"Low":0.702,"Mid":0.238,"High":0.06},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.5,"shots":[{"y":37.0,"z":0.0,"o":1,"so":false,"comp":"Premier League","vs":"West Ham United"},{"y":44.1,"z":0.4,"o":0,"so":false,"comp":"Premier League","vs":"Aston Villa"},{"y":43.3,"z":0.7,"o":1,"so":false,"comp":"Premier League","vs":"West Bromwich Albion"},{"y":36.7,"z":0.5,"o":1,"so":false,"comp":"Premier League","vs":"Chelsea"},{"y":37.2,"z":1.5,"o":1,"so":false,"comp":"Premier League","vs":"Stoke City"}],"teams":["Manchester City"],"comps":["Premier League"],"so_n":0,"so_rate":null,"ig_rate":0.8,"last5":"4/5","streak":3,"streak_t":"scored","pred":0.325,"cross":0.55,"natural":0.399,"gk_d":"Left","gk_c":"MEDIUM","first":"2016-01-23","last":"2016-04-23"},{"id":3944,"name":"Gylfi \u00de\u00f3r Sigur\u00f0sson","pens":5,"goals":4,"rate":0.8,"foot":"Right Foot","dir":{"Left":0.425,"Center":0.301,"Right":0.274},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.104,"Bottom-Right":0.08,"Mid-Center":0.142,"Mid-Left":0.175,"Mid-Right":0.045,"Top-Center":0.141,"Top-Left":0.146,"Top-Right":0.149},"height":{"Low":0.202,"Mid":0.363,"High":0.435},"top_dir":"Left","top_zone":"Mid-Left","conf":0.5,"shots":[{"y":39.5,"z":1.4,"o":1,"so":false,"comp":"Premier League","vs":"Southampton"},{"y":37.5,"z":1.0,"o":1,"so":false,"comp":"Premier League","vs":"Sunderland"},{"y":36.4,"z":2.0,"o":1,"so":false,"comp":"Premier League","vs":"Everton"},{"y":43.2,"z":3.9,"o":0,"so":false,"comp":"FIFA World Cup","vs":"Nigeria"},{"y":40.7,"z":2.4,"o":1,"so":false,"comp":"FIFA World Cup","vs":"Croatia"}],"teams":["Swansea City","Iceland"],"comps":["FIFA World Cup","Premier League"],"so_n":0,"so_rate":null,"ig_rate":0.8,"last5":"4/5","streak":1,"streak_t":"scored","pred":0.138,"cross":0.425,"natural":0.274,"gk_d":"Left","gk_c":"MEDIUM","first":"2015-09-26","last":"2018-06-26"},{"id":4964,"name":"Ashley Hatch","pens":5,"goals":5,"rate":1.0,"foot":"Right Foot","dir":{"Left":0.425,"Center":0.051,"Right":0.524},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.23,"Bottom-Right":0.08,"Mid-Center":0.018,"Mid-Left":0.175,"Mid-Right":0.045,"Top-Center":0.016,"Top-Left":0.021,"Top-Right":0.399},"height":{"Low":0.327,"Mid":0.238,"High":0.435},"top_dir":"Right","top_zone":"Top-Right","conf":0.5,"shots":[{"y":43.4,"z":1.9,"o":1,"so":false,"comp":"NWSL","vs":"North Carolina Courage"},{"y":36.7,"z":1.5,"o":1,"so":false,"comp":"NWSL","vs":"Chicago Red Stars"},{"y":43.4,"z":2.3,"o":1,"so":false,"comp":"NWSL","vs":"Angel City"},{"y":43.3,"z":2.1,"o":1,"so":false,"comp":"NWSL","vs":"San Diego Wave"},{"y":36.6,"z":0.2,"o":1,"so":false,"comp":"NWSL","vs":"Portland Thorns"}],"teams":["Washington Spirit"],"comps":["NWSL"],"so_n":0,"so_rate":null,"ig_rate":1.0,"last5":"5/5","streak":5,"streak_t":"scored","pred":0.286,"cross":0.425,"natural":0.524,"gk_d":"Right","gk_c":"MEDIUM","first":"2023-04-16","last":"2023-08-28"},{"id":6394,"name":"Aritz Aduriz Zubeldia","pens":5,"goals":3,"rate":0.6,"foot":"Right Foot","dir":{"Left":0.425,"Center":0.176,"Right":0.399},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.354,"Bottom-Right":0.205,"Mid-Center":0.018,"Mid-Left":0.05,"Mid-Right":0.17,"Top-Center":0.141,"Top-Left":0.021,"Top-Right":0.024},"height":{"Low":0.577,"Mid":0.238,"High":0.185},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.5,"shots":[{"y":42.4,"z":0.4,"o":0,"so":false,"comp":"La Liga","vs":"Sporting Gij\u00f3n"},{"y":40.2,"z":1.9,"o":1,"so":false,"comp":"La Liga","vs":"Rayo Vallecano"},{"y":36.6,"z":0.4,"o":1,"so":false,"comp":"La Liga","vs":"Las Palmas"},{"y":36.0,"z":0.5,"o":0,"so":false,"comp":"La Liga","vs":"Granada"},{"y":43.7,"z":1.1,"o":1,"so":false,"comp":"La Liga","vs":"Celta Vigo"}],"teams":["Athletic Club"],"comps":["La Liga"],"so_n":0,"so_rate":null,"ig_rate":0.6,"last5":"3/5","streak":1,"streak_t":"scored","pred":0.138,"cross":0.425,"natural":0.399,"gk_d":"Left","gk_c":"MEDIUM","first":"2015-10-26","last":"2016-05-01"},{"id":6401,"name":"Kevin Gameiro","pens":5,"goals":4,"rate":0.8,"foot":"Right Foot","dir":{"Left":0.8,"Center":0.051,"Right":0.149},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.605,"Bottom-Right":0.08,"Mid-Center":0.018,"Mid-Left":0.175,"Mid-Right":0.045,"Top-Center":0.016,"Top-Left":0.021,"Top-Right":0.024},"height":{"Low":0.702,"Mid":0.238,"High":0.06},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.5,"shots":[{"y":37.3,"z":0.1,"o":1,"so":false,"comp":"La Liga","vs":"Getafe"},{"y":37.9,"z":1.2,"o":1,"so":false,"comp":"La Liga","vs":"Sporting Gij\u00f3n"},{"y":37.5,"z":0.2,"o":1,"so":false,"comp":"La Liga","vs":"Athletic Club"},{"y":38.2,"z":0.2,"o":0,"so":false,"comp":"La Liga","vs":"Real Madrid"},{"y":37.0,"z":0.3,"o":1,"so":false,"comp":"La Liga","vs":"Real Sociedad"}],"teams":["Sevilla"],"comps":["La Liga"],"so_n":0,"so_rate":null,"ig_rate":0.8,"last5":"4/5","streak":1,"streak_t":"scored","pred":0.7,"cross":0.8,"natural":0.149,"gk_d":"Left","gk_c":"MEDIUM","first":"2015-10-24","last":"2016-04-03"},{"id":6595,"name":"Daniel Parejo Mu\u00f1oz","pens":5,"goals":4,"rate":0.8,"foot":"Right Foot","dir":{"Left":0.425,"Center":0.176,"Right":0.399},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.23,"Bottom-Right":0.33,"Mid-Center":0.142,"Mid-Left":0.175,"Mid-Right":0.045,"Top-Center":0.016,"Top-Left":0.021,"Top-Right":0.024},"height":{"Low":0.577,"Mid":0.363,"High":0.06},"top_dir":"Left","top_zone":"Bottom-Right","conf":0.5,"shots":[{"y":37.9,"z":0.4,"o":0,"so":false,"comp":"La Liga","vs":"Barcelona"},{"y":39.5,"z":1.3,"o":1,"so":false,"comp":"La Liga","vs":"M\u00e1laga"},{"y":43.4,"z":0.2,"o":1,"so":false,"comp":"La Liga","vs":"Real Madrid"},{"y":43.1,"z":0.2,"o":1,"so":false,"comp":"La Liga","vs":"Barcelona"},{"y":36.7,"z":1.4,"o":1,"so":false,"comp":"La Liga","vs":"Barcelona"}],"teams":["Valencia"],"comps":["La Liga"],"so_n":0,"so_rate":null,"ig_rate":0.8,"last5":"4/5","streak":4,"streak_t":"scored","pred":0.138,"cross":0.425,"natural":0.399,"gk_d":"Left","gk_c":"MEDIUM","first":"2015-04-18","last":"2019-02-02"},{"id":6723,"name":"Wissam Ben Yedder","pens":5,"goals":2,"rate":0.4,"foot":"Right Foot","dir":{"Left":0.675,"Center":0.051,"Right":0.274},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.479,"Bottom-Right":0.205,"Mid-Center":0.018,"Mid-Left":0.175,"Mid-Right":0.045,"Top-Center":0.016,"Top-Left":0.021,"Top-Right":0.024},"height":{"Low":0.702,"Mid":0.238,"High":0.06},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.5,"shots":[{"y":36.5,"z":0.1,"o":0,"so":false,"comp":"Ligue 1","vs":"AS Monaco"},{"y":36.5,"z":0.2,"o":1,"so":false,"comp":"Ligue 1","vs":"Guingamp"},{"y":38.3,"z":0.9,"o":0,"so":false,"comp":"Ligue 1","vs":"Guingamp"},{"y":43.4,"z":0.2,"o":1,"so":false,"comp":"Ligue 1","vs":"Bordeaux"},{"y":37.5,"z":0.2,"o":0,"so":false,"comp":"Ligue 1","vs":"Saint-\u00c9tienne"}],"teams":["Toulouse"],"comps":["Ligue 1"],"so_n":0,"so_rate":null,"ig_rate":0.4,"last5":"2/5","streak":1,"streak_t":"missed","pred":0.513,"cross":0.675,"natural":0.274,"gk_d":"Left","gk_c":"MEDIUM","first":"2016-01-24","last":"2016-04-30"},{"id":10514,"name":"Guro Reiten","pens":5,"goals":5,"rate":1.0,"foot":"Left Foot","dir":{"Left":0.675,"Center":0.051,"Right":0.274},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.605,"Bottom-Right":0.205,"Mid-Center":0.018,"Mid-Left":0.05,"Mid-Right":0.045,"Top-Center":0.016,"Top-Left":0.021,"Top-Right":0.024},"height":{"Low":0.827,"Mid":0.113,"High":0.06},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.5,"shots":[{"y":43.3,"z":0.2,"o":1,"so":true,"comp":"Women's World Cup","vs":"Australia Women's"},{"y":37.1,"z":0.2,"o":1,"so":false,"comp":"Women's World Cup","vs":"Philippines Women's"},{"y":37.1,"z":0.3,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Everton LFC"},{"y":37.2,"z":0.2,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Everton LFC"},{"y":36.5,"z":0.1,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Bristol City WFC"}],"teams":["Norway Women's","Chelsea FCW"],"comps":["FA Women's Super League","Women's World Cup"],"so_n":1,"so_rate":1.0,"ig_rate":1.0,"last5":"5/5","streak":5,"streak_t":"scored","pred":0.513,"cross":0.274,"natural":0.675,"gk_d":"Left","gk_c":"MEDIUM","first":"2019-06-22","last":"2024-05-05"},{"id":10755,"name":"Jonathan Viera Ramos","pens":5,"goals":4,"rate":0.8,"foot":"Right Foot","dir":{"Left":0.3,"Center":0.176,"Right":0.524},"zone":{"Bottom-Center":0.143,"Bottom-Left":0.104,"Bottom-Right":0.33,"Mid-Center":0.018,"Mid-Left":0.175,"Mid-Right":0.045,"Top-Center":0.016,"Top-Left":0.021,"Top-Right":0.149},"height":{"Low":0.577,"Mid":0.238,"High":0.185},"top_dir":"Right","top_zone":"Bottom-Right","conf":0.5,"shots":[{"y":38.5,"z":0.4,"o":1,"so":false,"comp":"La Liga","vs":"Granada"},{"y":43.4,"z":0.3,"o":1,"so":false,"comp":"La Liga","vs":"Celta Vigo"},{"y":43.0,"z":0.2,"o":1,"so":false,"comp":"La Liga","vs":"Getafe"},{"y":37.6,"z":1.0,"o":0,"so":false,"comp":"La Liga","vs":"Real Sociedad"},{"y":42.4,"z":1.9,"o":1,"so":false,"comp":"La Liga","vs":"Valencia"}],"teams":["Las Palmas"],"comps":["La Liga"],"so_n":0,"so_rate":null,"ig_rate":0.8,"last5":"4/5","streak":1,"streak_t":"scored","pred":0.286,"cross":0.3,"natural":0.524,"gk_d":"Right","gk_c":"MEDIUM","first":"2015-12-30","last":"2016-04-02"},{"id":15227,"name":"Ver\u00f3nica Boquete Giad\u00e1ns","pens":5,"goals":4,"rate":0.8,"foot":"Right Foot","dir":{"Left":0.55,"Center":0.051,"Right":0.399},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.23,"Bottom-Right":0.33,"Mid-Center":0.018,"Mid-Left":0.3,"Mid-Right":0.045,"Top-Center":0.016,"Top-Left":0.021,"Top-Right":0.024},"height":{"Low":0.577,"Mid":0.363,"High":0.06},"top_dir":"Left","top_zone":"Bottom-Right","conf":0.5,"shots":[{"y":37.0,"z":1.6,"o":1,"so":false,"comp":"Serie A Women","vs":"Napoli W"},{"y":44.7,"z":0.4,"o":0,"so":false,"comp":"Serie A Women","vs":"Pomigliano"},{"y":36.5,"z":1.3,"o":1,"so":false,"comp":"Serie A Women","vs":"Como W"},{"y":43.8,"z":0.2,"o":1,"so":false,"comp":"Serie A Women","vs":"FC Internazionale Mila"},{"y":37.0,"z":0.5,"o":1,"so":false,"comp":"Serie A Women","vs":"FC Internazionale Mila"}],"teams":["Fiorentina W"],"comps":["Serie A Women"],"so_n":0,"so_rate":null,"ig_rate":0.8,"last5":"4/5","streak":3,"streak_t":"scored","pred":0.325,"cross":0.55,"natural":0.399,"gk_d":"Left","gk_c":"MEDIUM","first":"2023-10-08","last":"2024-05-01"},{"id":15579,"name":"Inessa Kaagman","pens":5,"goals":4,"rate":0.8,"foot":"Left Foot","dir":{"Left":0.175,"Center":0.426,"Right":0.399},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.104,"Bottom-Right":0.08,"Mid-Center":0.268,"Mid-Left":0.05,"Mid-Right":0.17,"Top-Center":0.141,"Top-Left":0.021,"Top-Right":0.149},"height":{"Low":0.202,"Mid":0.488,"High":0.31},"top_dir":"Center","top_zone":"Mid-Center","conf":0.5,"shots":[{"y":39.3,"z":1.2,"o":0,"so":false,"comp":"FA Women's Super Leagu","vs":"Birmingham City WFC"},{"y":43.0,"z":1.6,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Tottenham Hotspur Wome"},{"y":38.8,"z":1.8,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Reading WFC"},{"y":40.1,"z":0.9,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Aston Villa W"},{"y":43.2,"z":1.9,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Manchester United W"}],"teams":["Everton LFC","Brighton & Hove Albion WFC"],"comps":["FA Women's Super League"],"so_n":0,"so_rate":null,"ig_rate":0.8,"last5":"4/5","streak":4,"streak_t":"scored","pred":0.139,"cross":0.399,"natural":0.175,"gk_d":"Center","gk_c":"MEDIUM","first":"2019-04-17","last":"2021-04-04"},{"id":16386,"name":"Lucy Hope","pens":5,"goals":4,"rate":0.8,"foot":"Right Foot","dir":{"Left":0.3,"Center":0.176,"Right":0.524},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.23,"Bottom-Right":0.455,"Mid-Center":0.018,"Mid-Left":0.05,"Mid-Right":0.045,"Top-Center":0.141,"Top-Left":0.021,"Top-Right":0.024},"height":{"Low":0.702,"Mid":0.113,"High":0.185},"top_dir":"Right","top_zone":"Bottom-Right","conf":0.5,"shots":[{"y":41.7,"z":0.8,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Manchester City WFC"},{"y":43.8,"z":0.8,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Yeovil Town LFC"},{"y":36.7,"z":0.2,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Reading WFC"},{"y":39.8,"z":2.0,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Bristol City WFC"},{"y":43.1,"z":0.1,"o":0,"so":false,"comp":"FA Women's Super Leagu","vs":"Aston Villa W"}],"teams":["Everton LFC","Bristol City WFC"],"comps":["FA Women's Super League"],"so_n":0,"so_rate":null,"ig_rate":0.8,"last5":"4/5","streak":1,"streak_t":"missed","pred":0.286,"cross":0.3,"natural":0.524,"gk_d":"Right","gk_c":"MEDIUM","first":"2019-01-06","last":"2021-04-04"},{"id":16462,"name":"Hatem Ben Arfa","pens":5,"goals":5,"rate":1.0,"foot":"Left Foot","dir":{"Left":0.55,"Center":0.176,"Right":0.274},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.479,"Bottom-Right":0.08,"Mid-Center":0.142,"Mid-Left":0.05,"Mid-Right":0.17,"Top-Center":0.016,"Top-Left":0.021,"Top-Right":0.024},"height":{"Low":0.577,"Mid":0.363,"High":0.06},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.5,"shots":[{"y":36.4,"z":0.1,"o":1,"so":false,"comp":"Ligue 1","vs":"Troyes"},{"y":41.6,"z":1.3,"o":1,"so":false,"comp":"Ligue 1","vs":"Angers"},{"y":37.9,"z":0.2,"o":1,"so":false,"comp":"Ligue 1","vs":"Angers"},{"y":37.7,"z":0.5,"o":1,"so":false,"comp":"Ligue 1","vs":"Rennes"},{"y":42.0,"z":0.9,"o":1,"so":false,"comp":"Ligue 1","vs":"Stade de Reims"}],"teams":["OGC Nice"],"comps":["Ligue 1"],"so_n":0,"so_rate":null,"ig_rate":1.0,"last5":"5/5","streak":5,"streak_t":"scored","pred":0.325,"cross":0.274,"natural":0.55,"gk_d":"Left","gk_c":"MEDIUM","first":"2015-08-15","last":"2016-04-22"},{"id":19298,"name":"Samuel Eto''o Fils","pens":5,"goals":3,"rate":0.6,"foot":"Right Foot","dir":{"Left":0.675,"Center":0.051,"Right":0.274},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.354,"Bottom-Right":0.205,"Mid-Center":0.018,"Mid-Left":0.3,"Mid-Right":0.045,"Top-Center":0.016,"Top-Left":0.021,"Top-Right":0.024},"height":{"Low":0.577,"Mid":0.363,"High":0.06},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.5,"shots":[{"y":37.2,"z":1.0,"o":1,"so":false,"comp":"La Liga","vs":"C\u00e1diz"},{"y":36.4,"z":0.2,"o":1,"so":false,"comp":"La Liga","vs":"Atl\u00e9tico Madrid"},{"y":43.4,"z":0.5,"o":0,"so":false,"comp":"La Liga","vs":"Real Madrid"},{"y":36.5,"z":1.7,"o":1,"so":false,"comp":"La Liga","vs":"RC Deportivo La Coru\u00f1a"},{"y":37.4,"z":0.6,"o":0,"so":false,"comp":"La Liga","vs":"Real Betis"}],"teams":["Barcelona"],"comps":["La Liga"],"so_n":0,"so_rate":null,"ig_rate":0.6,"last5":"3/5","streak":1,"streak_t":"missed","pred":0.513,"cross":0.675,"natural":0.274,"gk_d":"Left","gk_c":"MEDIUM","first":"2005-12-17","last":"2009-02-14"},{"id":31540,"name":"Katie Zelem","pens":5,"goals":5,"rate":1.0,"foot":"Right Foot","dir":{"Left":0.675,"Center":0.051,"Right":0.274},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.605,"Bottom-Right":0.205,"Mid-Center":0.018,"Mid-Left":0.05,"Mid-Right":0.045,"Top-Center":0.016,"Top-Left":0.021,"Top-Right":0.024},"height":{"Low":0.827,"Mid":0.113,"High":0.06},"top_dir":"Left","top_zone":"Bottom-Left","conf":0.5,"shots":[{"y":43.6,"z":0.2,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Manchester United W"},{"y":36.8,"z":0.8,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Brighton & Hove Albion"},{"y":36.5,"z":0.2,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Manchester United W"},{"y":38.0,"z":0.2,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Manchester United W"},{"y":36.5,"z":0.5,"o":1,"so":false,"comp":"FA Women's Super Leagu","vs":"Manchester City WFC"}],"teams":["Manchester United","Manchester United W"],"comps":["FA Women's Super League"],"so_n":0,"so_rate":null,"ig_rate":1.0,"last5":"5/5","streak":5,"streak_t":"scored","pred":0.513,"cross":0.675,"natural":0.274,"gk_d":"Left","gk_c":"MEDIUM","first":"2019-09-28","last":"2023-11-19"},{"id":33178,"name":"Benjamin Moukandjo Bil\u00e9","pens":5,"goals":5,"rate":1.0,"foot":"Right Foot","dir":{"Left":0.3,"Center":0.176,"Right":0.524},"zone":{"Bottom-Center":0.018,"Bottom-Left":0.23,"Bottom-Right":0.205,"Mid-Center":0.018,"Mid-Left":0.05,"Mid-Right":0.17,"Top-Center":0.141,"Top-Left":0.021,"Top-Right":0.149},"height":{"Low":0.452,"Mid":0.238,"High":0.31},"top_dir":"Right","top_zone":"Bottom-Left","conf":0.5,"shots":[{"y":43.2,"z":0.2,"o":1,"so":false,"comp":"Ligue 1","vs":"Bastia"},{"y":43.7,"z":2.2,"o":1,"so":false,"comp":"Ligue 1","vs":"Guingamp"},{"y":42.4,"z":1.5,"o":1,"so":false,"comp":"Ligue 1","vs":"Troyes"},{"y":39.0,"z":2.3,"o":1,"so":false,"comp":"Ligue 1","vs":"Gaz\u00e9lec Ajaccio"},{"y":36.6,"z":0.3,"o":1,"so":false,"comp":"Ligue 1","vs":"Nantes"}],"teams":["Lorient"],"comps":["Ligue 1"],"so_n":0,"so_rate":null,"ig_rate":1.0,"last5":"5/5","streak":5,"streak_t":"scored","pred":0.286,"cross":0.3,"natural":0.524,"gk_d":"Right","gk_c":"MEDIUM","first":"2015-08-16","last":"2016-02-13"}],"total":1479,"n_players":773,"lb":{"pred":[{"name":"Antonio Candreva","pens":8,"val":0.646,"dir":"Left"},{"name":"Zlatan Ibrahimovi\u0107","pens":7,"val":0.61,"dir":"Left"},{"name":"Nikita Parris","pens":7,"val":0.61,"dir":"Left"},{"name":"Georgia Stanway","pens":6,"val":0.567,"dir":"Left"},{"name":"Josip Ili\u010di\u0107","pens":8,"val":0.481,"dir":"Right"},{"name":"Paulo Bruno Exequiel Dybala","pens":7,"val":0.46,"dir":"Left"},{"name":"Youssef El-Arabi","pens":7,"val":0.429,"dir":"Right"},{"name":"F\u00e1bio Henrique Tavares","pens":6,"val":0.4,"dir":"Left"},{"name":"Andrea Belotti","pens":6,"val":0.4,"dir":"Left"},{"name":"Riyad Mahrez","pens":6,"val":0.366,"dir":"Right"}],"conv":[{"name":"Paulo Bruno Exequiel Dybala","pens":7,"val":1.0},{"name":"Thierry Henry","pens":7,"val":1.0},{"name":"Youssef El-Arabi","pens":7,"val":1.0},{"name":"F\u00e1bio Henrique Tavares","pens":6,"val":1.0},{"name":"Josip Ili\u010di\u0107","pens":8,"val":0.875},{"name":"Harry Kane","pens":14,"val":0.857},{"name":"Troy Deeney","pens":7,"val":0.857},{"name":"Zlatan Ibrahimovi\u0107","pens":7,"val":0.857},{"name":"Marta Vieira da Silva","pens":7,"val":0.857},{"name":"Megan Anna Rapinoe","pens":7,"val":0.857}],"exp":[{"name":"Lionel Andr\u00e9s Messi Cuccittini","pens":82,"val":0.805},{"name":"Cristiano Ronaldo dos Santos Aveiro","pens":23,"val":0.783},{"name":"Ronaldo de Assis Moreira","pens":16,"val":0.812},{"name":"Neymar da Silva Santos Junior","pens":15,"val":0.8},{"name":"Harry Kane","pens":14,"val":0.857},{"name":"Kylian Mbapp\u00e9 Lottin","pens":12,"val":0.75},{"name":"Luis Alberto Su\u00e1rez D\u00edaz","pens":10,"val":0.8},{"name":"Kim Little","pens":10,"val":0.7},{"name":"Antoine Griezmann","pens":9,"val":0.667},{"name":"Josip Ili\u010di\u0107","pens":8,"val":0.875}]}};

/* ═══════ LIVE DATA LAYER (Phase 4) ═══════
   The app ships with EMBEDDED_DATA so it works as a standalone component, but
   when served as a site it fetches /data.json (the full player set exported by
   export_frontend_data.py). DATA is mutated in place on load and a tiny pub/sub
   forces a re-render via useLiveData(). */
let DATA = EMBEDDED_DATA;
const _dataSubs = new Set();
function _notify() { _dataSubs.forEach((fn) => fn()); }
function loadLiveData() {
  const base = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.BASE_URL) || "/";
  fetch(`${base}data.json`, { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : null))
    .then((json) => {
      if (json && Array.isArray(json.players) && json.players.length) {
        DATA = json;
        _notify();
      }
    })
    .catch(() => {/* keep embedded data */});
}
function useLiveData() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    _dataSubs.add(fn);
    return () => _dataSubs.delete(fn);
  }, []);
  return DATA;
}


/* ═══════ CONSTANTS ═══════ */
const GW = 460, GH = 154, Y_MIN = 36, Y_MAX = 44, Z_MAX = 2.67;
const toX = (y) => ((y - Y_MIN) / (Y_MAX - Y_MIN)) * GW;
const toYY = (z) => GH - (Math.min(z, Z_MAX) / Z_MAX) * GH;
const ZONES = [
  { k: "Top-Left", x: 0, y: 0 }, { k: "Top-Center", x: 1, y: 0 }, { k: "Top-Right", x: 2, y: 0 },
  { k: "Mid-Left", x: 0, y: 1 }, { k: "Mid-Center", x: 1, y: 1 }, { k: "Mid-Right", x: 2, y: 1 },
  { k: "Bottom-Left", x: 0, y: 2 }, { k: "Bottom-Center", x: 1, y: 2 }, { k: "Bottom-Right", x: 2, y: 2 },
];
const heatRGB = (p) => {
  if (p < 0.04) return "rgba(20,40,80,0.15)";
  if (p < 0.08) return "rgba(20,80,140,0.25)";
  if (p < 0.14) return "rgba(0,160,130,0.35)";
  if (p < 0.22) return "rgba(255,180,0,0.45)";
  if (p < 0.35) return "rgba(255,100,20,0.55)";
  return "rgba(255,40,20,0.65)";
};
const FEATURED_NAMES = ["Lionel Andrés Messi Cuccittini", "Cristiano Ronaldo dos Santos Aveiro", "Harry Kane", "Kylian Mbappé Lottin", "Neymar da Silva Santos Junior", "Zlatan Ibrahimović"];

/* ═══════ GAME THEORY: optimal keeper mixed strategy ═══════
   Mirrors game_theory.py. Penalties are zero-sum: a smart taker randomizes, so
   the keeper's best play is a MIX, not always diving the modal side. We blend
   the unexploitable equilibrium with a best-response weighted by how exploitable
   the taker actually is. Reach matrix encodes that a correct dive still isn't a
   guaranteed save and corners are harder than central shots. */
const DIRS3 = ["Left", "Center", "Right"];
const REACH = [
  [0.65, 0.15, 0.05],   // dive Left:   reach vs [L, C, R] shots
  [0.10, 0.90, 0.10],   // stay Center
  [0.05, 0.15, 0.65],   // dive Right
];
function keeperStrategy(dir, conv = 0.78, height = null) {
  const d = DIRS3.map((k) => dir[k] || 0);
  const ds = d.reduce((a, b) => a + b, 0) || 1;
  const dn = d.map((x) => x / ds);
  const finish = [1.05, 0.9, 1.05].map((b) => Math.min(0.99, Math.max(0.05, conv * b)));
  let R = REACH.map((row) => row.slice());
  if (height && height.High != null) {
    const pen = 1 - 0.5 * height.High;
    R = R.map((row) => row.map((v) => v * pen));
  }
  // payoff[a][j] = save prob when keeper dives a vs shot dir j
  const payoff = R.map((row, a) => row.map((v, j) => v * (1 - finish[j])));
  // Fictitious play to approximate the zero-sum equilibrium (no LP in browser).
  let kc = [1, 0, 0], tc = [0, 0, 1];
  for (let it = 0; it < 4000; it++) {
    const tm = tc.map((x) => x / tc.reduce((a, b) => a + b, 0));
    const kev = payoff.map((row) => row.reduce((s, v, j) => s + v * tm[j], 0));
    kc[kev.indexOf(Math.max(...kev))]++;
    const km = kc.map((x) => x / kc.reduce((a, b) => a + b, 0));
    const tev = DIRS3.map((_, j) => km.reduce((s, p, a) => s + p * payoff[a][j], 0));
    tc[tev.indexOf(Math.min(...tev))]++;
  }
  const eqMix = kc.map((x) => x / kc.reduce((a, b) => a + b, 0));
  const takerEq = tc.map((x) => x / tc.reduce((a, b) => a + b, 0));
  // Best response to the taker's ACTUAL mix, blended in by exploitability.
  const brVals = payoff.map((row) => row.reduce((s, v, j) => s + v * dn[j], 0));
  const brIdx = brVals.indexOf(Math.max(...brVals));
  const br = [0, 0, 0]; br[brIdx] = 1;
  const exploit = DIRS3.reduce((s, _, j) => s + Math.abs(dn[j] - takerEq[j]), 0) / 2;
  const lean = Math.min(0.85, exploit * 1.5);
  let mix = eqMix.map((v, i) => (1 - lean) * v + lean * br[i]);
  const ms = mix.reduce((a, b) => a + b, 0); mix = mix.map((x) => x / ms);
  const top = Math.max(...mix);
  const timing = top > 0.6 ? "Commit early" : top < 0.45 ? "Commit late" : "Balanced";
  const out = {};
  DIRS3.forEach((k, i) => (out[k] = mix[i]));
  return {
    strategy: out,
    dive: DIRS3[mix.indexOf(top)],
    timing,
    exploitability: exploit,
  };
}

const SHORT = (n) => {
  if (n.includes("Messi")) return "L. Messi";
  if (n.includes("Cristiano") && n.includes("Ronaldo")) return "C. Ronaldo";
  if (n.includes("Assis")) return "Ronaldinho";
  if (n.includes("Neymar")) return "Neymar Jr";
  if (n.includes("Mbappé")) return "K. Mbappé";
  if (n.includes("Ibrahimović")) return "Ibrahimović";
  if (n.includes("Griezmann")) return "Griezmann";
  if (n.includes("Suárez")) return "L. Suárez";
  const p = n.split(" ");
  return p.length <= 2 ? n : p[0][0] + ". " + p[p.length - 1];
};

const FONT = `'Barlow Condensed',sans-serif`;
const BODY = `'DM Sans',sans-serif`;
const ACCENT = "#00e676";
const BG = "#080c10";
const CARD = "rgba(255,255,255,0.02)";
const BORDER = "rgba(255,255,255,0.05)";
const MUTED = "#3a4a5a";

/* ═══════ SHARED STYLES ═══════ */
const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
* { box-sizing: border-box; margin: 0; }
::placeholder { color: #3a4a5a; }
input:focus { border-color: rgba(0,230,118,0.3) !important; outline: none; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
button { border: none; cursor: pointer; font-family: ${FONT}; }
`;

/* ═══════ NAVIGATION ═══════ */
function Nav({ page, setPage }) {
  return (
    <nav style={{ background: "rgba(8,12,16,0.95)", borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)" }}>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setPage("home")}>
          <span style={{ fontSize: 18 }}>🧤</span>
          <span style={{ fontSize: 18, fontFamily: FONT, fontWeight: 800, letterSpacing: -0.5 }}>
            <span style={{ color: "#f0f0f0" }}>THE KEEPER'S</span> <span style={{ color: ACCENT }}>EYES</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[["home", "Home"], ["scout", "Scout"], ["compare", "Compare"], ["duel", "Duel"]].map(([key, label]) => (
            <button key={key} onClick={() => setPage(key)} style={{
              padding: "6px 16px", borderRadius: 6, fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
              background: page === key ? "rgba(0,230,118,0.12)" : "transparent",
              color: page === key ? ACCENT : "#6b7b8d",
              transition: "all 0.2s",
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ═══════ GOAL VISUALIZATION ═══════ */
function GoalViz({ player, showShots, compact }) {
  const zones = player?.zone || DATA.pop.zone;
  const shots = showShots ? (player?.shots || []) : [];
  const zw = GW / 3, zh = GH / 3;
  return (
    <svg viewBox={`-28 -22 ${GW + 56} ${GH + 44}`} style={{ width: "100%", maxWidth: compact ? 400 : 540 }}>
      <defs>
        <linearGradient id="pitch" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#163016" /><stop offset="100%" stopColor="#0e200e" /></linearGradient>
        <pattern id="net" width={16} height={16} patternUnits="userSpaceOnUse"><path d={`M0,0 L16,16 M16,0 L0,16`} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} fill="none" /></pattern>
        <filter id="sg"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <linearGradient id="pg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#c8c8c8" /><stop offset="50%" stopColor="#fff" /><stop offset="100%" stopColor="#999" /></linearGradient>
      </defs>
      <rect x={-28} y={-22} width={GW + 56} height={GH + 44} fill="url(#pitch)" rx={6} />
      <rect x={0} y={0} width={GW} height={GH} fill="url(#net)" />
      <rect x={0} y={0} width={GW} height={GH} fill="rgba(0,0,0,0.2)" />
      {ZONES.map((z) => {
        const prob = zones[z.k] || 0;
        return (
          <g key={z.k}>
            <rect x={z.x * zw + 1} y={z.y * zh + 1} width={zw - 2} height={zh - 2} fill={heatRGB(prob)} rx={2} />
            <text x={z.x * zw + zw / 2} y={z.y * zh + zh / 2 - 3} textAnchor="middle" fill="rgba(255,255,255,0.92)" fontSize={compact ? 12 : 15} fontFamily={FONT} fontWeight={700}>{(prob * 100).toFixed(0)}%</text>
            {!compact && <text x={z.x * zw + zw / 2} y={z.y * zh + zh / 2 + 11} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={7.5} fontFamily={BODY}>{z.k.replace("-", " ")}</text>}
          </g>
        );
      })}
      <rect x={-5} y={-5} width={5} height={GH + 5} fill="url(#pg)" rx={2} />
      <rect x={GW} y={-5} width={5} height={GH + 5} fill="url(#pg)" rx={2} />
      <rect x={-5} y={-5} width={GW + 10} height={5} fill="url(#pg)" rx={2} />
      {shots.map((s, i) => {
        const cx = toX(s.y), cy = toYY(s.z);
        if (cx < -5 || cx > GW + 5 || cy < -5 || cy > GH + 5) return null;
        return (<g key={i}><circle cx={cx} cy={cy} r={5} fill={s.o ? "#00e676" : "#ff1744"} opacity={0} stroke={s.o ? "#b9f6ca" : "#ff8a80"} strokeWidth={1} filter="url(#sg)"><animate attributeName="opacity" from="0" to="0.9" dur={`${0.15 + i * 0.04}s`} fill="freeze" /></circle>{s.so && <circle cx={cx} cy={cy} r={8.5} fill="none" stroke="#ffd740" strokeWidth={1} opacity={0.45} />}</g>);
      })}
      <text x={2} y={GH + 18} fill="rgba(255,255,255,0.18)" fontSize={8} fontFamily={BODY}>← GK Left</text>
      <text x={GW - 2} y={GH + 18} textAnchor="end" fill="rgba(255,255,255,0.18)" fontSize={8} fontFamily={BODY}>GK Right →</text>
    </svg>
  );
}

/* ═══════ HOME PAGE ═══════ */
function HomePage({ setPage, setInitialPlayer }) {
  const goToPlayer = (name) => {
    const p = DATA.players.find((x) => x.name === name);
    if (p) { setInitialPlayer(p); setPage("scout"); }
  };

  const topZones = Object.entries(DATA.pop.zone).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ padding: "0 16px 48px", maxWidth: 620, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "48px 0 36px" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🧤</div>
        <h1 style={{ fontSize: 42, fontFamily: FONT, fontWeight: 800, letterSpacing: -1, lineHeight: 1, margin: "0 0 8px" }}>
          <span style={{ color: "#f0f0f0" }}>THE KEEPER'S</span><br /><span style={{ color: ACCENT }}>EYES</span>
        </h1>
        <p style={{ fontSize: 14, color: "#5a6a7a", fontFamily: BODY, lineHeight: 1.5, maxWidth: 400, margin: "0 auto 24px" }}>
          An AI-powered penalty scouting tool that analyzes shot placement patterns to help goalkeepers predict where penalty takers will shoot.
        </p>
        <button onClick={() => setPage("scout")} style={{
          padding: "12px 32px", borderRadius: 8, fontSize: 14, fontWeight: 700, letterSpacing: 1,
          background: ACCENT, color: "#080c10", transition: "transform 0.15s",
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          OPEN SCOUT →
        </button>
      </div>

      {/* Key Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 32 }}>
        {[
          { n: DATA.total.toLocaleString(), l: "Penalties Analyzed", c: ACCENT },
          { n: DATA.n_players, l: "Players Profiled", c: "#64b5f6" },
          { n: "50+", l: "Competitions", c: "#ffd740" },
        ].map((s) => (
          <div key={s.l} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.c, fontFamily: FONT }}>{s.n}</div>
            <div style={{ fontSize: 10, color: MUTED, fontFamily: BODY, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Population Heatmap */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 28 }}>
        <h3 style={{ fontSize: 13, fontFamily: FONT, fontWeight: 700, letterSpacing: 1.5, color: "#5a6a7a", textTransform: "uppercase", marginBottom: 12 }}>
          Where Do Players Shoot?
        </h3>
        <p style={{ fontSize: 12, color: "#4a5a6a", fontFamily: BODY, marginBottom: 14, lineHeight: 1.5 }}>
          Aggregated across all {DATA.total.toLocaleString()} penalties. The bottom corners dominate — {(topZones[0][1] * 100).toFixed(0)}% of all penalties go {topZones[0][0].replace("-", " ").toLowerCase()}.
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoalViz player={null} showShots={false} compact />
        </div>
      </div>

      {/* Leaderboards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
        <LeaderCard title="Most Predictable" subtitle="Easiest to read" data={DATA.lb.pred} formatter={(v) => `${(v.val * 100).toFixed(0)}%`} accent="#ff8a65" onClick={goToPlayer} extra={(v) => `→ ${v.dir}`} />
        <LeaderCard title="Best Converters" subtitle="6+ penalties taken" data={DATA.lb.conv} formatter={(v) => `${(v.val * 100).toFixed(0)}%`} accent={ACCENT} onClick={goToPlayer} />
      </div>

      {/* How It Works */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, marginBottom: 28 }}>
        <h3 style={{ fontSize: 13, fontFamily: FONT, fontWeight: 700, letterSpacing: 1.5, color: "#5a6a7a", textTransform: "uppercase", marginBottom: 14 }}>How It Works</h3>
        {[
          { icon: "📊", title: "Data Collection", desc: "1,481 penalties extracted from StatsBomb open data spanning 50+ competitions from 1974 to 2025, each with precise 3D shot coordinates." },
          { icon: "🧠", title: "Dual Model Architecture", desc: "Bayesian player profiles learn individual tendencies with Dirichlet smoothing. An XGBoost classifier captures interaction effects between features like foot preference, shootout pressure, and historical patterns." },
          { icon: "🎯", title: "Prediction", desc: "Validated honestly with walk-forward testing (the model only sees a player's prior penalties). Lift over the league baseline grows with a taker's history — modest but real, in line with the research literature for history-based models." },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 2 ? 14 : 0 }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#c0c8d0", fontFamily: FONT, marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: "#4a5a6a", fontFamily: BODY, lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tech Stack */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: MUTED, fontFamily: BODY, letterSpacing: 0.5 }}>
          Python · XGBoost · Bayesian Inference · React · StatsBomb Open Data
        </div>
      </div>
    </div>
  );
}

function LeaderCard({ title, subtitle, data, formatter, accent, onClick, extra }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 12, fontFamily: FONT, fontWeight: 700, color: "#8899aa", letterSpacing: 0.5, marginBottom: 2 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 9, color: MUTED, fontFamily: BODY, marginBottom: 10 }}>{subtitle}</div>}
      {data.slice(0, 5).map((v, i) => (
        <div key={i} onClick={() => onClick(v.name)} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "5px 0", borderBottom: i < 4 ? `1px solid rgba(255,255,255,0.03)` : "none", cursor: "pointer",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: MUTED, fontFamily: FONT, width: 14, textAlign: "right" }}>{i + 1}</span>
            <span style={{ fontSize: 11, color: "#b0b8c0", fontFamily: BODY }}>{SHORT(v.name)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {extra && <span style={{ fontSize: 9, color: MUTED }}>{extra(v)}</span>}
            <span style={{ fontSize: 12, fontWeight: 700, color: accent, fontFamily: FONT }}>{formatter(v)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════ SCOUT PAGE COMPONENTS ═══════ */
function DirBars({ player }) {
  const dirs = player ? player.dir : DATA.pop.direction;
  const topDir = player?.top_dir || Object.entries(dirs).sort((a, b) => b[1] - a[1])[0][0];
  const pop = DATA.pop.direction;
  return (
    <div>
      {["Left", "Center", "Right"].map((d) => {
        const prob = dirs[d] || 0;
        const popV = pop[d] || 0;
        const isTop = d === topDir;
        const diff = prob - popV;
        return (
          <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{ width: 48, fontSize: 11, color: "#6b7b8d", fontFamily: BODY, textAlign: "right" }}>{d}</span>
            <div style={{ flex: 1, height: 20, background: "rgba(255,255,255,0.03)", borderRadius: 4, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: `${popV * 100}%`, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.1)" }} />
              <div style={{ width: `${prob * 100}%`, height: "100%", background: isTop ? `linear-gradient(90deg, #00c853, ${ACCENT})` : "linear-gradient(90deg, rgba(80,130,190,0.4), rgba(80,130,190,0.2))", borderRadius: 4, transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)" }} />
              <div style={{ position: "absolute", right: 6, top: 2, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: isTop ? ACCENT : "#8899aa", fontFamily: FONT }}>{(prob * 100).toFixed(0)}%</span>
                {player && Math.abs(diff) > 0.03 && <span style={{ fontSize: 9, color: diff > 0 ? "#ffd740" : "#64b5f6" }}>{diff > 0 ? "▲" : "▼"}{Math.abs(diff * 100).toFixed(0)}</span>}
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ fontSize: 9, color: MUTED, marginTop: 3, fontFamily: BODY }}>Thin line = league avg · ▲▼ deviation from avg</div>
    </div>
  );
}

function OptimalStrategy({ player }) {
  if (!player) return null;
  const gt = useMemo(
    () => keeperStrategy(player.dir, player.rate ?? 0.78, player.height),
    [player]
  );
  const pct = (x) => Math.round(x * 100);
  const exploitPct = pct(gt.exploitability);
  const exploitLabel = exploitPct > 25 ? "Highly exploitable" : exploitPct > 12 ? "Somewhat exploitable" : "Disciplined";
  const barColor = { Left: "#42a5f5", Center: "#ab47bc", Right: ACCENT };
  return (
    <div style={{ background: "rgba(0,230,118,0.04)", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "13px 16px", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: MUTED, fontFamily: FONT, fontWeight: 600 }}>Optimal Dive Strategy</div>
        <div style={{ fontSize: 10, color: gt.timing === "Commit early" ? ACCENT : gt.timing === "Commit late" ? "#ffd740" : MUTED, fontFamily: FONT, fontWeight: 700 }}>{gt.timing}</div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 9 }}>
        {DIRS3.map((k) => {
          const v = gt.strategy[k];
          return (
            <div key={k} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 46, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 4 }}>
                <div style={{ width: "70%", height: `${Math.max(6, v * 46)}px`, background: barColor[k], borderRadius: "4px 4px 0 0", opacity: 0.85, transition: "height 0.4s" }} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, fontFamily: FONT, color: barColor[k] }}>{pct(v)}%</div>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: MUTED, fontFamily: FONT }}>{k}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 10, color: MUTED, fontFamily: BODY, lineHeight: 1.5, borderTop: `1px solid ${BORDER}`, paddingTop: 8 }}>
        Against a perfect randomizer the unbeatable mix is even; this taker is <strong style={{ color: exploitPct > 12 ? ACCENT : "#8899aa" }}>{exploitLabel.toLowerCase()}</strong> ({exploitPct}% off-equilibrium), so the recommended mix leans toward <strong style={{ color: barColor[gt.dive] }}>{gt.dive}</strong>. A purely modal dive works until they adapt — mixing protects against that.
      </div>
    </div>
  );
}

function SequenceTag({ player }) {
  // Lightweight alternation read derived from the shot history embedded per
  // player. Flags takers whose next direction depends on their last.
  const seq = useMemo(() => {
    if (!player || !player.shots || player.shots.length < 3) return null;
    const dirs = player.shots.map((s) => (s.y < 38.67 ? "Left" : s.y > 41.33 ? "Right" : "Center"));
    let repeat = 0, switches = 0;
    for (let i = 1; i < dirs.length; i++) (dirs[i] === dirs[i - 1] ? repeat++ : switches++);
    const total = repeat + switches;
    if (total < 2) return null;
    const switchRate = switches / total;
    if (switchRate > 0.7) return { label: "Alternator", desc: "tends to switch sides between penalties", color: "#42a5f5" };
    if (switchRate < 0.3) return { label: "Streaky", desc: "tends to repeat the same side", color: "#ffd740" };
    return null;
  }, [player]);
  if (!seq) return null;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${seq.color}14`, border: `1px solid ${seq.color}33`, borderRadius: 6, padding: "4px 9px", marginTop: 8 }}>
      <span style={{ fontSize: 10, fontWeight: 800, fontFamily: FONT, color: seq.color, textTransform: "uppercase", letterSpacing: 1 }}>{seq.label}</span>
      <span style={{ fontSize: 10, color: MUTED, fontFamily: BODY }}>{seq.desc}</span>
    </div>
  );
}

function GKRec({ player }) {
  if (!player) return null;
  const conf = player.gk_c;
  const accents = { HIGH: ACCENT, MEDIUM: "#ffd740", LOW: "#78909c" };
  const a = accents[conf];
  return (
    <div style={{ background: `${a}0a`, border: `1px solid ${a}25`, borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: MUTED, fontFamily: FONT, fontWeight: 600, marginBottom: 1 }}>GK Recommendation</div>
        <div style={{ fontSize: 26, fontWeight: 800, fontFamily: FONT, color: a, letterSpacing: 1 }}>DIVE {player.gk_d.toUpperCase()}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: MUTED, fontFamily: FONT }}>Confidence</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: a, fontFamily: FONT }}>{conf}</div>
        <div style={{ fontSize: 10, color: MUTED, fontFamily: BODY }}>{(player.pred * 100).toFixed(0)}% predictable</div>
      </div>
    </div>
  );
}

function Pill({ label, value, sub, color = "#8899aa" }) {
  return (
    <div style={{ background: CARD, borderRadius: 8, padding: "9px 8px 7px", textAlign: "center", border: `1px solid ${BORDER}`, flex: "1 1 0", minWidth: 0 }}>
      <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: 1.5, color: MUTED, fontFamily: FONT, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color, fontFamily: FONT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: MUTED, fontFamily: BODY, marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

function ShotHistory({ shots }) {
  if (!shots || !shots.length) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: MUTED, fontFamily: FONT, fontWeight: 600, marginBottom: 6 }}>Penalty History</div>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {shots.map((s, i) => (
          <div key={i} title={`${s.comp}${s.vs ? " vs " + s.vs : ""}${s.so ? " (Shootout)" : ""}`} style={{
            width: 22, height: 22, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, fontFamily: FONT, cursor: "default",
            background: s.o ? "rgba(0,230,118,0.12)" : "rgba(255,23,68,0.12)",
            color: s.o ? ACCENT : "#ff1744",
            border: s.so ? "1px solid rgba(255,215,64,0.4)" : `1px solid transparent`,
          }}>
            {s.o ? "✓" : "✗"}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, fontSize: 9, color: MUTED, fontFamily: BODY, marginTop: 5 }}>
        <span>✓ Goal</span><span>✗ Miss/Save</span><span style={{ color: "#ffd740" }}>Gold = Shootout</span>
      </div>
    </div>
  );
}

function ScoutPage({ initialPlayer }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(initialPlayer || DATA.players[0]);
  const [showDrop, setShowDrop] = useState(false);
  const [showShots, setShowShots] = useState(true);

  useEffect(() => { if (initialPlayer) setSelected(initialPlayer); }, [initialPlayer]);

  const featured = useMemo(() => DATA.players.filter((p) => FEATURED_NAMES.includes(p.name)), []);
  const filtered = useMemo(() => {
    if (!query.trim()) return DATA.players.slice(0, 10);
    const q = query.toLowerCase();
    return DATA.players.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 10);
  }, [query]);

  const handleSelect = (p) => { setSelected(p); setQuery(""); setShowDrop(false); };
  const player = selected;

  const heightPref = player ? Object.entries(player.height).sort((a, b) => b[1] - a[1])[0] : null;
  const tendLabel = player ? (player.cross > player.natural ? "Cross-body" : player.natural > player.cross ? "Natural side" : "Mixed") : "";

  return (
    <div style={{ padding: "0 16px 48px", maxWidth: 620, margin: "0 auto" }}>
      {/* Featured quick-select */}
      <div style={{ display: "flex", gap: 5, padding: "14px 0 10px", overflowX: "auto" }}>
        {featured.map((p) => (
          <button key={p.id} onClick={() => handleSelect(p)} style={{
            padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: 0.3, whiteSpace: "nowrap",
            background: selected?.id === p.id ? `${ACCENT}15` : "rgba(255,255,255,0.03)",
            color: selected?.id === p.id ? ACCENT : "#6b7b8d",
            border: selected?.id === p.id ? `1px solid ${ACCENT}40` : `1px solid ${BORDER}`,
          }}>
            {SHORT(p.name)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <input type="text" placeholder="Search any player..." value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDrop(true); }}
          onFocus={() => setShowDrop(true)}
          onBlur={() => setTimeout(() => setShowDrop(false), 200)}
          style={{ width: "100%", padding: "10px 14px", fontSize: 14, background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#e0e0e0", fontFamily: BODY }}
        />
        {showDrop && filtered.length > 0 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, background: "#111820", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 8, marginTop: 4, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", maxHeight: 300, overflowY: "auto" }}>
            {filtered.map((p) => (
              <div key={p.id} onMouseDown={() => handleSelect(p)} style={{ padding: "8px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid rgba(255,255,255,0.03)` }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#d0d8e0" }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: MUTED }}>{p.foot} · {p.pens} pens · {p.teams[0]}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: ACCENT, fontFamily: FONT }}>{(p.rate * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Player Header */}
      {player && (
        <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div>
            <h2 style={{ fontSize: 24, fontFamily: FONT, fontWeight: 800, color: "#f0f0f0", letterSpacing: -0.5, lineHeight: 1.1, margin: "0 0 3px" }}>{player.name}</h2>
            <div style={{ fontSize: 12, color: "#4a5a6a", fontFamily: BODY }}>{player.foot.replace(" Foot", "")}-footed · {player.teams.join(", ")}</div>
          </div>
          <button onClick={() => exportScoutCard(player)} title="Export a printable scouting report"
            style={{ flexShrink: 0, marginTop: 2, background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`, color: ACCENT, borderRadius: 7, padding: "7px 12px", fontSize: 11, fontWeight: 700, fontFamily: FONT, letterSpacing: 0.3, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 13 }}>⎙</span> Scout Card
          </button>
        </div>
      )}

      {/* Goal Heatmap */}
      <div style={{ background: CARD, borderRadius: 12, padding: "12px 12px 8px", border: `1px solid ${BORDER}`, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: MUTED, fontFamily: FONT, fontWeight: 600 }}>Shot Placement</span>
          <button onClick={() => setShowShots(!showShots)} style={{ background: "none", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 4, color: showShots ? ACCENT : "#4a5a6a", fontSize: 9, padding: "2px 8px", fontFamily: BODY }}>
            {showShots ? "● Shots" : "○ Shots"}
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}><GoalViz player={player} showShots={showShots} /></div>
      </div>

      {/* GK Recommendation */}
      <GKRec player={player} />

      {/* Game-Theory Optimal Strategy (Phase 3) */}
      <OptimalStrategy player={player} />

      {/* Stats Row */}
      {player && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <Pill label="Taken" value={player.pens} color="#64b5f6" />
          <Pill label="Conv." value={`${(player.rate * 100).toFixed(0)}%`} sub={`${player.goals} goals`} color={ACCENT} />
          <Pill label="Last 5" value={player.last5} color={parseInt(player.last5) >= 4 ? ACCENT : parseInt(player.last5) >= 3 ? "#ffd740" : "#ff8a80"} />
          <Pill label="Streak" value={player.streak} sub={player.streak_t} color={player.streak_t === "scored" ? ACCENT : "#ff8a80"} />
        </div>
      )}

      {/* Direction Breakdown */}
      {player && (
        <div style={{ background: CARD, borderRadius: 10, padding: 14, marginBottom: 14, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: MUTED, marginBottom: 8, fontFamily: FONT, fontWeight: 600 }}>Direction Breakdown</div>
          <DirBars player={player} />
        </div>
      )}

      {/* Secondary Stats */}
      {player && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          <Pill label="Tendency" value={tendLabel} sub={`${(Math.max(player.cross, player.natural) * 100).toFixed(0)}%`} color="#b388ff" />
          <Pill label="Fav Zone" value={player.top_zone.replace("-", " ")} color={ACCENT} />
          <Pill label="Height" value={heightPref[0]} sub={`${(heightPref[1] * 100).toFixed(0)}%`} color="#ffd740" />
          {player.so_n > 0 && <Pill label="Shootout" value={player.so_n} sub={player.so_rate != null ? `${(player.so_rate * 100).toFixed(0)}%` : ""} color="#80deea" />}
        </div>
      )}

      {/* Shot History */}
      {player && <ShotHistory shots={player.shots} />}
      {player && <SequenceTag player={player} />}
    </div>
  );
}

/* ═══════ SCOUT CARD EXPORT (Phase 4) ═══════
   Opens a clean, print-optimized report in a new window. The browser's print
   dialog ("Save as PDF") turns it into a one-page scouting PDF — no server or
   PDF library required, so it works in any static deployment. */
function exportScoutCard(player) {
  if (!player) return;
  const gt = keeperStrategy(player.dir, player.rate ?? 0.78, player.height);
  const pct = (x) => Math.round((x || 0) * 100);
  const dirRow = ["Left", "Center", "Right"].map((k) =>
    `<td><b>${pct(player.dir[k])}%</b><span>${k}</span></td>`).join("");
  const ksRow = ["Left", "Center", "Right"].map((k) =>
    `<td><b>${pct(gt.strategy[k])}%</b><span>${k}</span></td>`).join("");
  const heightTop = Object.entries(player.height || {}).sort((a, b) => b[1] - a[1])[0];
  const shotsDots = (player.shots || []).map((s) =>
    `<span class="dot ${s.o ? "g" : "m"}">${s.o ? "✓" : "✗"}</span>`).join("");
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Scout Card — ${player.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',sans-serif;color:#0a1018;padding:34px 40px;background:#fff}
    h1{font-family:'Barlow Condensed',sans-serif;font-size:34px;letter-spacing:-.5px;color:#06140d}
    .sub{color:#5a6b7a;font-size:13px;margin-bottom:4px}
    .rule{height:3px;background:#00b25a;width:64px;margin:10px 0 18px;border-radius:2px}
    .grid{display:flex;gap:14px;margin-bottom:18px}
    .box{flex:1;border:1px solid #e2e8ee;border-radius:10px;padding:13px 15px}
    .lbl{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a99a8;font-weight:700;margin-bottom:9px}
    table{width:100%;border-collapse:collapse;text-align:center}
    td{padding:4px 2px}
    td b{font-family:'Barlow Condensed',sans-serif;font-size:23px;display:block;color:#06140d}
    td span{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#8a99a8}
    .rec{background:#06140d;color:#fff;border-radius:10px;padding:16px 18px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center}
    .rec .big{font-family:'Barlow Condensed',sans-serif;font-size:30px;color:#19e676;letter-spacing:1px}
    .rec .t{font-size:12px;color:#9fb0bf;text-align:right;line-height:1.5}
    .stats{display:flex;gap:10px;margin-bottom:18px}
    .stat{flex:1;text-align:center;border:1px solid #e2e8ee;border-radius:8px;padding:9px}
    .stat b{font-family:'Barlow Condensed',sans-serif;font-size:20px;display:block}
    .stat span{font-size:10px;color:#8a99a8;text-transform:uppercase;letter-spacing:1px}
    .dots{display:flex;gap:4px;flex-wrap:wrap;margin-top:6px}
    .dot{width:20px;height:20px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700}
    .dot.g{background:#d6f7e4;color:#06924a}.dot.m{background:#fde0e0;color:#c62828}
    .note{font-size:11px;color:#5a6b7a;line-height:1.6;margin-top:6px}
    .foot{margin-top:26px;font-size:10px;color:#aab6c2;border-top:1px solid #eef2f5;padding-top:10px}
    @media print{body{padding:18px 24px}@page{margin:14mm}}
  </style></head><body>
    <h1>${player.name}</h1>
    <div class="sub">${player.foot.replace(" Foot", "")}-footed &middot; ${(player.teams || []).join(", ")} &middot; ${player.pens} penalties, ${pct(player.rate)}% conversion</div>
    <div class="rule"></div>
    <div class="rec">
      <div><div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9fb0bf;font-family:'Barlow Condensed'">Recommended Dive</div>
      <div class="big">DIVE ${(gt.dive || "").toUpperCase()}</div></div>
      <div class="t">${gt.timing}<br>${pct(gt.exploitability)}% exploitable<br>${pct(player.pred)}% predictable</div>
    </div>
    <div class="grid">
      <div class="box"><div class="lbl">Where They Aim</div><table><tr>${dirRow}</tr></table></div>
      <div class="box"><div class="lbl">Optimal Dive Mix</div><table><tr>${ksRow}</tr></table></div>
    </div>
    <div class="stats">
      <div class="stat"><b>${player.last5}</b><span>Last 5</span></div>
      <div class="stat"><b>${player.streak} ${player.streak_t === "scored" ? "✓" : "✗"}</b><span>Streak</span></div>
      <div class="stat"><b>${heightTop ? heightTop[0] : "—"}</b><span>Height</span></div>
      <div class="stat"><b>${player.so_n || 0}</b><span>Shootouts</span></div>
    </div>
    <div class="box"><div class="lbl">Penalty History (recent)</div><div class="dots">${shotsDots || "<span class='note'>No shot data</span>"}</div>
      <div class="note">${player.seq_pattern && player.seq_pattern !== "memoryless"
        ? `Sequential note: tends to behave as a <b>${player.seq_pattern}</b> (direction depends on the previous penalty).`
        : "No strong sequential pattern — treat each penalty independently."}</div>
    </div>
    <div class="foot">The Keeper's Eyes &middot; Data: StatsBomb Open Data (CC BY-SA 4.0) &middot; Generated ${new Date().toLocaleDateString()}<br>
    Strategy is a game-theoretic mixed recommendation; a purely modal dive works until the taker adapts.</div>
    <script>setTimeout(()=>window.print(),400)</script>
  </body></html>`);
  w.document.close();
}

/* ═══════ COMPARE PAGE (Phase 4) ═══════ */
function PlayerPicker({ label, selected, onSelect, exclude }) {
  const data = useLiveData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const list = useMemo(() => {
    const pool = data.players.filter((p) => p.id !== exclude);
    if (!query.trim()) return pool.slice(0, 10);
    const q = query.toLowerCase();
    return pool.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 10);
  }, [query, exclude, data]);
  return (
    <div style={{ flex: 1, position: "relative" }}>
      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: MUTED, fontFamily: FONT, fontWeight: 600, marginBottom: 5 }}>{label}</div>
      <input value={query} placeholder={selected ? selected.name : "Search player..."}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 200)}
        style={{ width: "100%", padding: "9px 12px", fontSize: 13, background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#e0e0e0", fontFamily: BODY }} />
      {open && list.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 30, background: "#111820", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 8, marginTop: 4, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", maxHeight: 280, overflowY: "auto" }}>
          {list.map((p) => (
            <div key={p.id} onMouseDown={() => { onSelect(p); setQuery(""); setOpen(false); }}
              style={{ padding: "8px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", borderBottom: `1px solid rgba(255,255,255,0.03)` }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <span style={{ fontSize: 12, color: "#d0d8e0" }}>{p.name}</span>
              <span style={{ fontSize: 12, color: ACCENT, fontFamily: FONT, fontWeight: 700 }}>{(p.rate * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompareBars({ a, b }) {
  // Direction comparison as mirrored bars.
  const dirs = ["Left", "Center", "Right"];
  return (
    <div style={{ background: CARD, borderRadius: 10, padding: 14, border: `1px solid ${BORDER}`, marginBottom: 12 }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: MUTED, fontFamily: FONT, fontWeight: 600, marginBottom: 10 }}>Direction Tendency</div>
      {dirs.map((k) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 36, textAlign: "right", fontSize: 14, fontFamily: FONT, fontWeight: 700, color: "#64b5f6" }}>{Math.round((a.dir[k] || 0) * 100)}</div>
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", height: 14, background: "rgba(255,255,255,0.03)", borderRadius: 3 }}>
            <div style={{ width: `${(a.dir[k] || 0) * 100}%`, background: "#42a5f5", borderRadius: 3, opacity: 0.8 }} />
          </div>
          <div style={{ width: 52, textAlign: "center", fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: MUTED, fontFamily: FONT }}>{k}</div>
          <div style={{ flex: 1, display: "flex", height: 14, background: "rgba(255,255,255,0.03)", borderRadius: 3 }}>
            <div style={{ width: `${(b.dir[k] || 0) * 100}%`, background: ACCENT, borderRadius: 3, opacity: 0.8 }} />
          </div>
          <div style={{ width: 36, fontSize: 14, fontFamily: FONT, fontWeight: 700, color: ACCENT }}>{Math.round((b.dir[k] || 0) * 100)}</div>
        </div>
      ))}
    </div>
  );
}

function ComparePage() {
  const data = useLiveData();
  const [a, setA] = useState(data.players[0]);
  const [b, setB] = useState(data.players[1] || data.players[0]);
  // keep selections valid if the dataset swaps in under us
  useEffect(() => {
    if (!a && data.players[0]) setA(data.players[0]);
    if (!b && data.players[1]) setB(data.players[1]);
  }, [data]);
  if (!a || !b) return <div style={{ padding: 40, textAlign: "center", color: MUTED }}>Loading players…</div>;

  const gtA = keeperStrategy(a.dir, a.rate ?? 0.78, a.height);
  const gtB = keeperStrategy(b.dir, b.rate ?? 0.78, b.height);
  const row = (label, av, bv, fmt = (x) => x, better = "high") => {
    const aw = better === "high" ? av > bv : av < bv;
    const bw = better === "high" ? bv > av : bv < av;
    return (
      <div style={{ display: "flex", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ flex: 1, textAlign: "right", fontSize: 15, fontFamily: FONT, fontWeight: 700, color: aw ? "#64b5f6" : "#7b8a99" }}>{fmt(av)}</div>
        <div style={{ width: 130, textAlign: "center", fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: MUTED, fontFamily: FONT }}>{label}</div>
        <div style={{ flex: 1, fontSize: 15, fontFamily: FONT, fontWeight: 700, color: bw ? ACCENT : "#7b8a99" }}>{fmt(bv)}</div>
      </div>
    );
  };

  return (
    <div style={{ padding: "16px 16px 48px", maxWidth: 620, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontFamily: FONT, fontWeight: 800, color: "#f0f0f0", letterSpacing: -0.5, marginBottom: 4 }}>Compare Takers</h2>
      <div style={{ fontSize: 12, color: "#4a5a6a", fontFamily: BODY, marginBottom: 16 }}>Side-by-side tendencies and optimal-dive reads for two penalty takers.</div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <PlayerPicker label="Player A" selected={a} onSelect={setA} exclude={b?.id} />
        <PlayerPicker label="Player B" selected={b} onSelect={setB} exclude={a?.id} />
      </div>

      <div style={{ display: "flex", marginBottom: 4 }}>
        <div style={{ flex: 1, textAlign: "right", paddingRight: 8 }}>
          <div style={{ fontSize: 16, fontFamily: FONT, fontWeight: 800, color: "#64b5f6", lineHeight: 1.1 }}>{SHORT(a.name)}</div>
        </div>
        <div style={{ width: 130 }} />
        <div style={{ flex: 1, paddingLeft: 8 }}>
          <div style={{ fontSize: 16, fontFamily: FONT, fontWeight: 800, color: ACCENT, lineHeight: 1.1 }}>{SHORT(b.name)}</div>
        </div>
      </div>

      <div style={{ background: CARD, borderRadius: 10, padding: "4px 16px 10px", border: `1px solid ${BORDER}`, marginBottom: 14 }}>
        {row("Penalties", a.pens, b.pens)}
        {row("Conversion", a.rate, b.rate, (x) => `${(x * 100).toFixed(0)}%`)}
        {row("Predictability", a.pred, b.pred, (x) => `${(x * 100).toFixed(0)}%`, "low")}
        {row("Top direction", a.top_dir, b.top_dir, (x) => x, null)}
        {row("Optimal dive", gtA.dive, gtB.dive, (x) => x, null)}
        {row("Commit timing", gtA.timing, gtB.timing, (x) => x, null)}
        {row("Exploitability", gtA.exploitability, gtB.exploitability, (x) => `${Math.round(x * 100)}%`)}
      </div>

      <CompareBars a={a} b={b} />

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><GoalViz player={a} showShots compact /></div>
        <div style={{ flex: 1 }}><GoalViz player={b} showShots compact /></div>
      </div>
    </div>
  );
}

/* ═══════ DUEL MODE (Phase 5) ═══════
   Flip the app: YOU are the keeper. Pick a real taker, read their run-up, and
   dive before the ball is struck. The taker shoots from their actual direction
   distribution (nudged by their sequence pattern when present); saves resolve
   with the same reach model the game-theory layer uses. After 5 kicks we score
   you against the optimal mixed strategy and tell you if you got exploited. */
const REACH_DUEL = { Left: [0.65, 0.15, 0.05], Center: [0.10, 0.90, 0.10], Right: [0.05, 0.15, 0.65] };

function sampleDir(probs, lastDir, pattern) {
  // Base sample from the taker's direction distribution, lightly biased by
  // their sequence tendency (alternators avoid repeating, streaky repeat).
  let p = DIRS3.map((k) => Math.max(0, probs[k] || 0));
  if (lastDir && pattern && pattern !== "memoryless") {
    const li = DIRS3.indexOf(lastDir);
    if (li >= 0) {
      if (pattern === "alternator") p[li] *= 0.45;
      else if (pattern === "repeater" || pattern === "streaky") p[li] *= 1.6;
    }
  }
  const s = p.reduce((a, b) => a + b, 0) || 1;
  p = p.map((x) => x / s);
  let r = Math.random(), acc = 0;
  for (let i = 0; i < 3; i++) { acc += p[i]; if (r <= acc) return DIRS3[i]; }
  return "Right";
}

function DuelPage() {
  const data = useLiveData();
  const [taker, setTaker] = useState(null);
  const [phase, setPhase] = useState("pick");      // pick | ready | result | done
  const [round, setRound] = useState(0);
  const [log, setLog] = useState([]);              // {dive, shot, saved}
  const [shot, setShot] = useState(null);
  const [dive, setDive] = useState(null);
  const [query, setQuery] = useState("");
  const [streak, setStreak] = useState(0);         // consecutive games with 3+ saves
  const [best, setBest] = useState(0);
  const [shared, setShared] = useState(false);
  const ROUNDS = 5;

  const featured = useMemo(() => {
    const named = data.players.filter((p) => FEATURED_NAMES.includes(p.name));
    return (named.length ? named : data.players).slice(0, 6);
  }, [data]);

  // Full searchable roster (all players, most-faced first), filtered by query.
  const roster = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = [...data.players].sort((a, b) => b.pens - a.pens);
    return q ? pool.filter((p) => p.name.toLowerCase().includes(q)) : pool;
  }, [data, query]);

  const start = (p) => { setTaker(p); setPhase("ready"); setRound(0); setLog([]); setShot(null); setDive(null); setShared(false); };

  const makeDive = (d) => {
    if (phase !== "ready") return;
    const last = log.length ? log[log.length - 1].shot : null;
    const s = sampleDir(taker.dir, last, taker.seq_pattern);
    // Two independent factors: did you read the side, and was it saveable?
    //   reachP   — how well your chosen dive covers the shot's side
    //   placement— chance the shot is "beatable" even when you read it right
    //              (better finishers tuck it away more often)
    const reachP = REACH_DUEL[d][DIRS3.indexOf(s)];
    const conv = taker.rate ?? 0.78;
    // Correct-side dives now save the majority of the time; only well-placed
    // shots from strong takers beat a correct read. Center shots are easiest
    // to save when you stay. Tunable: raise floor / lower beatable to taste.
    const beatable = Math.min(0.55, Math.max(0.15, (conv - 0.5))) * (s === "Center" ? 0.5 : 1);
    const saved = Math.random() < reachP * (1 - beatable);
    setDive(d); setShot(s);
    setLog((L) => [...L, { dive: d, shot: s, saved }]);
    setPhase("result");
  };

  const next = () => {
    if (round + 1 >= ROUNDS) {
      const finalSaves = log.filter((l) => l.saved).length;
      setStreak((prev) => {
        const ns = finalSaves >= 3 ? prev + 1 : 0;
        setBest((b) => Math.max(b, ns));
        return ns;
      });
      setPhase("done");
      return;
    }
    setRound((r) => r + 1); setShot(null); setDive(null); setPhase("ready");
  };

  const shareResult = (finalSaves, gt) => {
    const txt = `🧤 The Keeper's Eyes — I saved ${finalSaves}/${ROUNDS} against ${SHORT(taker.name)}`
      + (gt ? ` (the AI would dive ${gt.dive}, ${gt.timing.toLowerCase()}).` : ".")
      + ` Can you read the penalty better than the model?`;
    if (navigator.share) {
      navigator.share({ title: "The Keeper's Eyes", text: txt }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(txt).then(() => { setShared(true); setTimeout(() => setShared(false), 2000); }).catch(() => {});
    }
  };

  const saves = log.filter((l) => l.saved).length;
  // Optimal-mix comparison: how often did YOU dive the taker's modal side vs
  // a varied strategy, and how exploitable were you?
  const gt = taker ? keeperStrategy(taker.dir, taker.rate ?? 0.78, taker.height) : null;
  const userMix = DIRS3.map((k) => log.filter((l) => l.dive === k).length / (log.length || 1));
  const optMix = gt ? DIRS3.map((k) => gt.strategy[k]) : [0, 0, 0];
  const drift = gt ? Math.round(DIRS3.reduce((s, _, i) => s + Math.abs(userMix[i] - optMix[i]), 0) / 2 * 100) : 0;

  const Goal = ({ highlight }) => (
    <svg viewBox={`-10 -10 ${GW + 20} ${GH + 30}`} style={{ width: "100%", maxWidth: 460 }}>
      <rect x="0" y="0" width={GW} height={GH} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
      {[1, 2].map((i) => <line key={i} x1={(GW / 3) * i} y1="0" x2={(GW / 3) * i} y2={GH} stroke="rgba(255,255,255,0.06)" />)}
      {DIRS3.map((k, i) => {
        const on = highlight && highlight.includes(k);
        return <rect key={k} x={(GW / 3) * i} y="0" width={GW / 3} height={GH}
          fill={on ? (k === (shot) && k === (dive) ? "rgba(0,230,118,0.18)" : "rgba(255,255,255,0.05)") : "transparent"} />;
      })}
      {shot && (() => {
        const i = DIRS3.indexOf(shot); const cx = (GW / 3) * i + GW / 6;
        return <circle cx={cx} cy={GH * 0.6} r="11" fill={log[log.length - 1]?.saved ? "#ffd740" : "#ff1744"} stroke="#fff" strokeWidth="2" />;
      })()}
      {dive && (() => {
        const i = DIRS3.indexOf(dive); const cx = (GW / 3) * i + GW / 6;
        return <text x={cx} y={GH + 20} textAnchor="middle" fontSize="20" fill={ACCENT}>🧤</text>;
      })()}
    </svg>
  );

  return (
    <div style={{ padding: "16px 16px 48px", maxWidth: 620, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontFamily: FONT, fontWeight: 800, color: "#f0f0f0", letterSpacing: -0.5, marginBottom: 4 }}>Beat the Keeper</h2>
      <div style={{ fontSize: 12, color: "#4a5a6a", fontFamily: BODY, marginBottom: 18 }}>You're in goal. Read the taker and dive before they strike — {ROUNDS} kicks. The AI knows their tendencies; do you?</div>

      {phase === "pick" || !taker ? (
        <div>
          {streak > 0 && (
            <div style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`, borderRadius: 8, padding: "8px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontFamily: BODY, color: "#8899aa" }}>🔥 Win streak: <b style={{ color: ACCENT, fontFamily: FONT }}>{streak}</b></span>
              <span style={{ fontSize: 11, fontFamily: BODY, color: MUTED }}>Best: {best}</span>
            </div>
          )}

          {!query && (
            <>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: MUTED, fontFamily: FONT, fontWeight: 600, marginBottom: 10 }}>Featured opponents</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
                {featured.map((p) => (
                  <button key={p.id} onClick={() => start(p)} style={{ textAlign: "left", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px", color: "#d0d8e0" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: FONT, color: "#f0f0f0" }}>{SHORT(p.name)}</div>
                    <div style={{ fontSize: 10, color: MUTED, fontFamily: BODY, marginTop: 2 }}>{p.pens} pens · {(p.rate * 100).toFixed(0)}% · {p.foot.replace(" Foot", "")}-footed</div>
                  </button>
                ))}
              </div>
            </>
          )}

          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: MUTED, fontFamily: FONT, fontWeight: 600, marginBottom: 8 }}>Or face any taker ({data.players.length})</div>
          <input type="text" placeholder="Search all players..." value={query} onChange={(e) => setQuery(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", fontSize: 14, background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#e0e0e0", fontFamily: BODY, marginBottom: 10 }} />
          <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
            {roster.slice(0, 60).map((p) => (
              <button key={p.id} onClick={() => start(p)} style={{ textAlign: "left", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 13px", color: "#d0d8e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: BODY, color: "#d0d8e0" }}>{p.name}</span>
                <span style={{ fontSize: 11, color: MUTED, fontFamily: BODY }}>{p.pens} pens · {(p.rate * 100).toFixed(0)}%</span>
              </button>
            ))}
            {roster.length === 0 && <div style={{ fontSize: 12, color: MUTED, fontFamily: BODY, padding: "10px 2px" }}>No players match "{query}".</div>}
            {roster.length > 60 && <div style={{ fontSize: 11, color: MUTED, fontFamily: BODY, padding: "8px 2px" }}>Showing 60 of {roster.length} — keep typing to narrow.</div>}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: FONT, color: "#f0f0f0" }}>{SHORT(taker.name)}</div>
            <div style={{ fontSize: 13, fontFamily: FONT, color: MUTED }}>Kick {Math.min(round + 1, ROUNDS)} / {ROUNDS} · <span style={{ color: ACCENT }}>{saves} saved</span></div>
          </div>

          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 14px 8px", marginBottom: 14, display: "flex", justifyContent: "center" }}>
            <Goal highlight={phase === "result" ? [shot, dive] : null} />
          </div>

          {phase === "ready" && (
            <div>
              <div style={{ textAlign: "center", fontSize: 11, color: MUTED, fontFamily: BODY, marginBottom: 8 }}>Dive now — pick a side</div>
              <div style={{ display: "flex", gap: 8 }}>
                {DIRS3.map((k) => (
                  <button key={k} onClick={() => makeDive(k)} style={{ flex: 1, background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`, color: ACCENT, borderRadius: 10, padding: "16px 0", fontSize: 14, fontWeight: 800, fontFamily: FONT, letterSpacing: 1, textTransform: "uppercase" }}>
                    {k === "Center" ? "Stay" : k}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === "result" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontFamily: FONT, fontWeight: 800, color: log[log.length - 1].saved ? ACCENT : "#ff1744", marginBottom: 4 }}>
                {log[log.length - 1].saved ? "SAVED! 🧤" : "GOAL"}
              </div>
              <div style={{ fontSize: 12, color: MUTED, fontFamily: BODY, marginBottom: 12 }}>
                They went <b style={{ color: "#f0f0f0" }}>{shot}</b>, you dove <b style={{ color: "#f0f0f0" }}>{dive === "Center" ? "stayed" : dive}</b>.
              </div>
              <button onClick={next} style={{ background: ACCENT, color: "#04130a", border: "none", borderRadius: 10, padding: "12px 32px", fontSize: 14, fontWeight: 800, fontFamily: FONT, letterSpacing: 0.5 }}>
                {round + 1 >= ROUNDS ? "See result" : "Next kick"}
              </button>
            </div>
          )}

          {phase === "done" && (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: MUTED, fontFamily: FONT, fontWeight: 600 }}>Final vs {SHORT(taker.name)}</div>
              <div style={{ fontSize: 40, fontFamily: FONT, fontWeight: 800, color: saves >= 3 ? ACCENT : "#ffd740", lineHeight: 1.1 }}>{saves} / {ROUNDS}</div>
              {streak > 0 && <div style={{ fontSize: 12, color: ACCENT, fontFamily: FONT, fontWeight: 700, marginTop: 2 }}>🔥 {streak} game win streak</div>}
              <div style={{ fontSize: 12, color: "#8899aa", fontFamily: BODY, lineHeight: 1.6, margin: "10px 0 16px" }}>
                You dove {drift > 25 ? <b style={{ color: "#ff8a65" }}>predictably</b> : drift > 12 ? <b style={{ color: "#ffd740" }}>fairly evenly</b> : <b style={{ color: ACCENT }}>near-optimally</b>} — {drift}% off the game-theory mix.
                {gt && <> The model would dive <b style={{ color: ACCENT }}>{gt.dive}</b> most, {gt.timing.toLowerCase()}.</>}
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button onClick={() => start(taker)} style={{ flex: 1, background: `${ACCENT}12`, border: `1px solid ${ACCENT}30`, color: ACCENT, borderRadius: 10, padding: "12px 0", fontSize: 13, fontWeight: 800, fontFamily: FONT }}>Rematch</button>
                <button onClick={() => { setTaker(null); setPhase("pick"); setQuery(""); }} style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`, color: "#8899aa", borderRadius: 10, padding: "12px 0", fontSize: 13, fontWeight: 700, fontFamily: FONT }}>New opponent</button>
              </div>
              <button onClick={() => shareResult(saves, gt)} style={{ width: "100%", background: "transparent", border: `1px solid ${BORDER}`, color: shared ? ACCENT : "#8899aa", borderRadius: 10, padding: "10px 0", fontSize: 12, fontWeight: 700, fontFamily: FONT, letterSpacing: 0.5 }}>
                {shared ? "✓ Copied to clipboard" : "↗ Share result"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════ APP ROOT ═══════ */
export default function App() {
  const [page, setPage] = useState("home");
  const [initialPlayer, setInitialPlayer] = useState(null);
  useLiveData();                       // re-render when /data.json resolves
  useEffect(() => { loadLiveData(); }, []);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#d0d8e0" }}>
      <style>{globalCSS}</style>
      <Nav page={page} setPage={setPage} />
      {page === "home" && <HomePage setPage={setPage} setInitialPlayer={setInitialPlayer} />}
      {page === "scout" && <ScoutPage initialPlayer={initialPlayer} />}
      {page === "compare" && <ComparePage />}
      {page === "duel" && <DuelPage />}
      <footer style={{ textAlign: "center", padding: "16px 16px 24px", fontSize: 9, color: "#1a2430", fontFamily: BODY, lineHeight: 1.6 }}>
        Data: StatsBomb Open Data (CC BY-SA 4.0) · Model: XGBoost + Bayesian Profiles + Game Theory
        <br />The Keeper's Eyes © 2025
      </footer>
    </div>
  );
}