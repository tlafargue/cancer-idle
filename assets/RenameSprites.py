import os
import math


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
	if filename.startswith("CancerCellsGreyedOut_"):
		cellNum = int(filename[33:-4])
		os.rename(filename, "Grey " + cellSize[cellNum] + " Cell.png")