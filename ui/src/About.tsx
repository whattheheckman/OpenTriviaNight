export default function About() {
    return (
        <div className="flex flex-col gap-4 my-4">
            <h1 className="text-xl font-semibold">How to Play</h1>
            <p>
              Open Trivia Night is a group-based trivia game, inspired by the likes of Jeopardy.
              The goal is to answer trivia questions correctly before the other players. 
              Questions have a points value associated, which are awarded to the player who first buzzes in with the correct answer.
            </p>
            <p>
              The game is designed to be played in a group who are able to communicate with each other out-of-band, i.e. in person or in a group call.
              The Hosts screen should ideally be visible to everybody in the game, so that they can easily choose and read questions.
              The game is playable without the Hosts screen visible, it just requires a little more verbal communication.
            </p>
            <p>
              One player designates themselves as the Host. 
              They create and control the game, and are in charge of reading questions, and awarding points to those who answer correctly.
            </p>

            <h2 className="text-lg font-semibold">How to Play - Contestant</h2>
            <p>
              First, the Host of the game needs to provide you with a Game ID.
              This is a 6-character code that you will use to join the game they have created.
              Once everybody is in, the Host can start the game.
            </p>
            <p>The game loop is as follows:</p>
            <p>
              
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  When the game begins, the Host picks a player who gets to pick the first question. This can be done using the heights or ages of the players.
                </li>
                <li>
                  The chosen player picks one of the cards shown.
                  The cards are grouped by Category, and only the points value of the question is shown.
                </li>
                <li>
                  Once a question has been picked, the Host will read it out. 
                  Once they have finished reading, your Answer button will be unlocked, allowing you to buzz in.
                  You cannot buzz in before the question has finished being read out.
                </li>
                <li>
                  The first player to buzz in will then be prompted by the Host to state their answer.
                  If correctly answered, the points value of the question is rewarded to the player.
                  If incorrectly answered, the points value is deducted from the players score, and the answer button will be unlocked again for the other players to buzz in. It is possible to enter negative points.
                </li>
                <li>
                  Once the question has been answered correctly, or skipped by the Host due to no answers given, then the last player to win points gets to pick the next question from the board.
                </li>
              </ol>
            </p>
        </div>
    )
}