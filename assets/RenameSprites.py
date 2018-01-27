import os
import math

cellType = {
	0: "Healthy",
	1: "Sick",
	2: "Degenerate",
	3: "Cancer"
}

cellSize = {
	0: "Minuscule",
	1: "Tiny",
	2: "Small",
	3: "Medium",
	4: "Big",
	5: "Huge",
	6: "Gigantic",
	7: "Colossal"
}

for filename in os.listdir("."):
	if filename.startswith("CancerCells_"):
		cellNum = int(filename[24:-4])
		os.rename(filename, cellSize[cellNum%8] + " " + cellType[math.floor(cellNum/8)] + " Cell.png")