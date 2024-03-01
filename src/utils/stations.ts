import { Network } from './metroNetwork';
import type { StationName } from './allLocations'

export const lines: StationName[][]  = [
    ["Helwan","Ain Helwan","Helwan University","Wadi Hof","Hadayek Helwan","El-Maasara","Tora El-Asmant","Kozzika","Tora El-Balad","Sakanat El-Maadi","Maadi","Hadayek El-Maadi","Dar El-Salam","El-Zahraa'","Mar Girgis","El-Malek El-Saleh","Al-Sayeda Zeinab","Saad Zaghloul","Sadat","Nasser","Orabi","Al-Shohadaa","Ghamra","El-Demerdash","Manshiet El-Sadr","Kobri El-Qobba","Hammamat El-Qobba","Saray El-Qobba","Hadayeq El-Zaitoun","Helmeyet El-Zaitoun","El-Matareyya","Ain Shams","Ezbet El-Nakhl","El-Marg","New El-Marg"],
    ["El-Mounib","Sakiat Mekky","Omm El-Masryeen","El Giza","Faisal","Cairo University","El Bohoth","Dokki","Opera","Sadat","Mohamed Naguib","Attaba","Al-Shohadaa","Masarra","Road El-Farag","St. Teresa","Khalafawy","Mezallat","Kolleyyet El-Zeraa","Shubra El-Kheima"],
    ["Nasser", 'Attaba','Bab El Shaaria','El Geish','Abdou Pasha','Abbassia','Fair Zone','Stadium','Koleyet El-Banat','Al-Ahram','Haroun','Heliopolis Square','Alf Maskan','Nadi El-Shams','El-Nozha','Hesham Barakat','Qobaa','Omar Ibn El-Khattab','El Haykestep','Adly Mansour']
];

const [line1, line2, line3] = lines

export const metro = new Network("Metro")
	.addLine("Line 1","#66FF66",  line1)
	.addLine("Line 2","#FFFF66", line2)
	.addLine("Line 3","#FF6666", line3)
    .distribute();