const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'covid19India.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3009/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
    districtName: dbObject.district_name,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  }
}

//APIs 1
app.get('/states/', async (request, response) => {
  const getDetail = `
  SELECT * 
  FROM state
  ;`
  const stateDetail = await db.all(getDetail)
  response.send(
    stateDetail.map(eachState => convertDbObjectToResponseObject(eachState)),
  )
})

//APIs 2
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getStateDetail = `
  SELECT * 
  FROM state
  WHERE 
  state_id = ${stateId}
  ;`
  const state = await db.get(getStateDetail)
  response.send(convertDbObjectToResponseObject(state))
})

//APIs 3
app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const addingState = `
  INSERT INTO 
  district(district_name, state_id, cases, cured, active, deaths)
  VALUES (
    ${districtName},'${stateId}','${cases}','${cured}','${active}','${deaths}');`
  await db.run(addingState)
  response.send('District Successfully Added')
})
module.exports = app
