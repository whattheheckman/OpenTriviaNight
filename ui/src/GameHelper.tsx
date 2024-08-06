import { Game } from "./Models";

export const GameHelper = {
  getQuestionById: (game: Game, questionId: string) => {
    let categoryIndex = game.rounds[game.currentRound].findIndex(category => category.questions.find(q => q.questionId === questionId));
    let questionIndex = game.rounds[game.currentRound][categoryIndex].questions.findIndex(x => x.questionId == questionId);
    return {
      categoryIndex: categoryIndex,
      category: game.rounds[game.currentRound][categoryIndex],
      questionIndex: questionIndex,
      question: game.rounds[game.currentRound][categoryIndex].questions[questionIndex]
    }
  }
}