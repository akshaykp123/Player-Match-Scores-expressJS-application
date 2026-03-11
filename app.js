const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const app = express()
app.use(express.json())
const path = require('path')
const dbpath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null
const initializeDB = async () => {
  db = await open({
    filename: dbpath,
    driver: sqlite3.Database,
  })
}

initializeDB()

app.get('/players/', async (request, response) => {
  const getPlayers = `
    SELECT
    player_id AS playerId,
    player_name AS playerName
    FROM 
    player_details
    `
  const players = await db.all(getPlayers)
  response.send(players)
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayers = `
    SELECT
    player_id AS playerId,
    player_name AS playerName
    FROM 
    player_details
    WHERE 
    player_id = ?;
    `
  const players = await db.get(getPlayers, [playerId])
  response.send(players)
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const getPlayers = `
    UPDATE player_details
    SET player_name = ?
    WHERE player_id = ?;
    `
  const players = await db.run(getPlayers, [playerName, playerId])
  response.send('Player Details Updated')
})

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getMatch = `
    SELECT 
    match_id AS matchId,
    match,
    year
    FROM 
    match_details
    WHERE match_id=?;
    `
  const players = await db.get(getMatch, [matchId])
  response.send(players)
})

app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params

  const getMatchesQuery = `
    SELECT 
      match_details.match_id AS matchId,
      match_details.match,
      match_details.year
    FROM 
      player_match_score
      INNER JOIN match_details 
      ON player_match_score.match_id = match_details.match_id
    WHERE 
      player_match_score.player_id = ?;
  `

  const matches = await db.all(getMatchesQuery, [playerId])
  response.send(matches)
})

app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getMatch = `
   SELECT 
      player_details.player_id AS playerId,
      player_details.player_name AS playerName
    FROM 
      player_match_score
      INNER JOIN player_details ON player_match_score.player_id = player_details.player_id
    WHERE 
      player_match_score.match_id = ?;
  `

  const players = await db.all(getMatch, [matchId])
  response.send(players)
})

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params

  const getPlayerStatsQuery = `
    SELECT 
      player_details.player_id AS playerId,
      player_details.player_name AS playerName,
      SUM(player_match_score.score) AS totalScore,
      SUM(player_match_score.fours) AS totalFours,
      SUM(player_match_score.sixes) AS totalSixes
    FROM 
      player_details
      INNER JOIN player_match_score 
      ON player_details.player_id = player_match_score.player_id
    WHERE 
      player_details.player_id = ?;
  `

  const playerStats = await db.get(getPlayerStatsQuery, [playerId])
  response.send(playerStats)
})

module.exports = app
