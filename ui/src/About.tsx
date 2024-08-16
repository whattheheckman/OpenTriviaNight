import { useEffect, useState } from "react";
import useApiClient from "./useApiClient";
import { Stats } from "./Models";

export default function About() {
  const [stats, setStats] = useState<Stats>({ gamesCount: 0 });
  const apiClient = useApiClient();

  useEffect(() => {
    apiClient.getStats()?.then((res) => setStats(res));
  }, [setStats]);

  return (
    <div className="flex flex-col gap-4 mt-4 mb-16">
      <h1 className="text-2xl font-semibold">How to Play</h1>
      <p>
        Open Trivia Night is a group-based trivia game, inspired by the likes of Jeopardy. The goal is to answer trivia questions correctly
        before the other players. Questions have a points value associated, which are awarded to the player who first buzzes in with the
        correct answer.
      </p>
      <p>
        The game is designed to be played in a group who are able to communicate with each other out-of-band, i.e. in person or in a group
        call. The Hosts screen should ideally be visible to everybody in the game, so that they can easily choose and read questions. The
        game is playable without the Hosts screen visible, it just requires a little more verbal communication.
      </p>
      <p>
        One player designates themselves as the Host. They create and control the game, and are in charge of reading questions, and awarding
        points to those who answer correctly.
      </p>

      <h2 className="text-xl font-semibold mt-4">How to Play - Contestant</h2>
      <p>
        First, the Host of the game needs to provide you with a Game ID. This is a 6-character code that you will use to join the game they
        have created. Once everybody is in, the Host can start the game.
      </p>
      <p>The game loop is as follows:</p>
      <ol className="list-decimal list-inside space-y-3">
        <li>When the game begins, the Host picks a player who gets to pick the first question.</li>
        <li>
          The chosen player picks one of the cards shown. The cards are grouped by Category, and only the points value of each question is
          shown.
        </li>
        <li>
          Once a question has been picked, the Host will read it out. When the Host has completed reading the question, your Answer button
          will be unlocked, allowing you to buzz in. You cannot buzz in before the question has finished being read out.
        </li>
        <li>
          The first player to buzz in will then be prompted by the Host to state their answer. If correctly answered, the points value of
          the question is rewarded to the player. If incorrectly answered, the points value is deducted from the players score, and the
          answer button will be unlocked again for the other players to buzz in. It is possible to enter negative points.
        </li>
        <li>
          Once the question has been answered correctly - or skipped by the Host due to no answers given - then the last player to win
          points gets to pick the next question from the board.
        </li>
      </ol>

      <h2 className="text-xl font-semibold mt-4">How to Play - Host</h2>
      <p>The Host is the player who creates the game, and chooses what questions will be in the game.</p>

      <h3 className="text-lg font-semibold mt-2">Creating the Game</h3>
      <p>
        A game consists of the number of rounds (1 minimum). Each round will contain a number of categories (4-5 recomended), and each
        category will contain a number of questions (5 recomended).
      </p>
      <p>
        Questions are made up of the question text, the correct answer, and the points value. It is recomended for the points value to
        increase for each question in the category.
      </p>
      {/* TODO: Add images showing example question sets */}
      <p>
        You have the option of either creating questions/categories manually, or using one of our integrated question sources (
        <a className="hover:underline text-sky-400" href="https://opentdb.com" target="_blank" rel="noopener noreferrer">
          Open Trivia Database
        </a>{" "}
        or{" "}
        <a className="hover:underline text-sky-400" href="https://the-trivia-api.com" target="_blank" rel="noopener noreferrer">
          The Trivia API
        </a>
        ) to generate questions for you.
      </p>
      <p>
        Once you have a suitable set of questions for your game, you can proceed to create the game and invite players by sharing the
        generated Game ID with them.
      </p>

      <h3 className="text-lg font-semibold mt-2">Hosting the Game</h3>
      <p>Hosting the game consists of 3 simple tasks:</p>
      <ol className="list-decimal list-inside space-y-3">
        <li>
          Selecting and reading out questions picked by the last Contestant to win points. When the game starts, the first question chooser
          is picked by you.
        </li>
        <li>
          When you have read out the selected question, you should "release" the buzzers (by clicking the 'Finished Reading' button) to
          allow Contestants to buzz in their answer. This is done to prevent Contestests buzzing in early.
        </li>
        <li>
          Only a single Contestant is allowed to buzz in at a time. When one has buzzed in, they should provide their answer to you. You
          will then decide if it is correct or not.
        </li>
      </ol>

      <hr />

      <p>There are currently <em>{stats.gamesCount}</em> games in progress.</p>
    </div>
  );
}
