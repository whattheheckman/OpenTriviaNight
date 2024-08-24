import { Game } from "./Models";

export const GameHelper = {
  getQuestionById: (game: Game, questionId: string) => {
    const categoryIndex = game.rounds[game.currentRound].findIndex((category) =>
      category.questions.find((q) => q.questionId === questionId)
    );
    const questionIndex = game.rounds[game.currentRound][categoryIndex].questions.findIndex((x) => x.questionId == questionId);
    return {
      categoryIndex: categoryIndex,
      category: game.rounds[game.currentRound][categoryIndex],
      questionIndex: questionIndex,
      question: game.rounds[game.currentRound][categoryIndex].questions[questionIndex],
    };
  },
  getQuestionTag: (game: Game, questionId: string) => {
    const data = GameHelper.getQuestionById(game, questionId);
    return `[${data.category.name} ${data.question.value}]`;
  },
};
