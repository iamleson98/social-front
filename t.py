from dataclasses import dataclass
from abc import ABC, abstractmethod
from enum import Enum
from typing import Optional


"""
  A B C D E F G H
1 W B W B W B W B
2 B W B W B W B W
3 W B W B W B W B
4 B W B W B W B W
5 W B W B W B W B
6 B W B W B W B W
7 W B W B W B W B
8 B W B W B W B W
"""

class Color(Enum):
	White = 0
	Black = 1

class PieceType(Enum):
	Pawn = 0
	Knight = 1
	Bishop = 2
	Rook = 3
	Queen = 4
	King = 5

class File(Enum):
	File_A = 'A'
	File_B = 'B'
	File_C = 'C'
	File_D = 'D'
	File_E = 'E'
	File_F = 'F'
	File_G = 'G'
	File_H = 'H'

	def isValid(self) -> bool:
		return self in File

class PieceType(Enum):
	PieceType_Pawn = 0
	PieceType_Knight = 1
	PieceType_Bishop = 2
	PieceType_Rook = 3
	PieceType_Queen = 4
	PieceType_King = 5

@dataclass
class Piece(ABC):
	color: Color
	pieceType: PieceType

	@abstractmethod
	def calculateNextMoves(self, start: "Square", end: "Square") -> list["Square"]:
		pass

class PiecePawn(Piece):
	def calculateNextMoves(self, currentPosition: "Square", game: "Game") -> list["Square"]:
		initPos = self.isInitialPosition(currentPosition)
		if initPos:
			pass

	def isInitialPosition(self, currentPosition: "Square") -> bool:
		if self.color == Color.White:
			return currentPosition.getRank() == Rank.Rank_2
		return currentPosition.getRank() == Rank.Rank_7

class PieceKnight(Piece):
	def calculateNextMoves(self, start: "Square", end: "Square") -> list["Square"]:
		pass

class PieceBishop(Piece):
	def calculateNextMoves(self, start: "Square", end: "Square") -> list["Square"]:
		pass

class PieceRook(Piece):
	def calculateNextMoves(self, start: "Square", end: "Square") -> list["Square"]:
		pass

class PieceQueen(PieceRook, PieceBishop):
	def calculateNextMoves(self, start: "Square", end: "Square") -> list["Square"]:
		pass

class PieceKing(Piece):
	def calculateNextMoves(self, start: "Square", end: "Square") -> list["Square"]:
		pass


class Rank(Enum):
	Rank_1 = 1
	Rank_2 = 2
	Rank_3 = 3
	Rank_4 = 4
	Rank_5 = 5
	Rank_6 = 6
	Rank_7 = 7
	Rank_8 = 8

	def isValid(self) -> bool:
		return self in Rank

class Square(object):
	# __file: File
	# __rank: Rank
	# __color: Color # pre-calculated during initialization
	# __piece: Optional[Piece] = None # None means cel holds no piece
	# __isValid: bool
	# __name: str

	def __init__(self, file: File, rank: Rank, piece: Optional[Piece] = None):
		self.__file = file
		self.__rank = rank
		self.__color = Color((ord(file.value) + rank.value) & 1)
		self.__piece = piece
		self.__isValid = self.__file.isValid() and self.__rank.isValid()
		self.__name = Square.getCellNameByFileAndRank(file, rank)

	def isValid(self) -> bool:
		return self.__isValid
	
	def setPiece(self, piece: Optional[Piece]) -> None:
		self.__piece = piece

	def getPiece(self) -> Optional[Piece]:
		return self.__piece
	
	def getColor(self) -> Color:
		return self.__color
	
	def getFile(self) -> File:
		return self.__file
	
	def getRank(self) -> Rank:
		return self.__rank
		
	def __str__(self) -> str:
		return self.__name
	
	@staticmethod
	def getCellNameByFileAndRank(file: File, rank: Rank) -> str:
		return f"{file.value}{rank.value}"


class Game(object):
	def __init__(self):
		self.__board: dict[str, Square] = {}
		self.initBoard()
		self.reOrganizeBoard()

	def initBoard(self) -> None:
		for file in File:
			for rank in Rank:
				square = Square(file=file, rank=rank)
				self.__board[str(square)] = square

	def reOrganizeBoard(self) -> None:
		for file in File:
			for pieceType in [PieceType.PieceType_Rook, PieceType.PieceType_Knight, PieceType.PieceType_Bishop, PieceType.PieceType_Queen, 
								PieceType.PieceType_King, PieceType.PieceType_Bishop, PieceType.PieceType_Knight, PieceType.PieceType_Rook]:
				self.__board[Square.getCellNameByFileAndRank(file, Rank.Rank_1)].setPiece(Piece(color=Color.Black, pieceType=pieceType))
				self.__board[Square.getCellNameByFileAndRank(file, Rank.Rank_2)].setPiece(Piece(color=Color.Black, pieceType=PieceType.PieceType_Pawn))
				self.__board[Square.getCellNameByFileAndRank(file, Rank.Rank_7)].setPiece(Piece(color=Color.White, pieceType=PieceType.PieceType_Pawn))
				self.__board[Square.getCellNameByFileAndRank(file, Rank.Rank_8)].setPiece(Piece(color=Color.White, pieceType=pieceType))

	def getBoard(self) -> dict[str, Square]:
		return self.__board

	def resetGame(self) -> None:
		for key in self.__board:
			self.__board[key].setPiece(None)
		self.reOrganizeBoard()


if __name__ == "__main__":
	for p in File:
		print(p)

