import { NextResponse } from 'next/server'

import { Amplify, API, graphqlOperation } from 'aws-amplify'
import { GraphQLResult } from "@aws-amplify/api"
import awsConfig from '@/src/aws-exports'

import * as m from '@/src/graphql/mutations'
import { JamSongInput, SetList } from '@/src/API'

// TODO Remove
const _generalUserId = "3d7fbd91-14fa-41da-935f-704ef74d7488"

export interface SetRequest {
  description: string,
  songs: JamSongInput[]
}

export async function POST(request: Request) {
  console.log(`${request.method} ${request.url}`)
  const b = await request.json() as SetRequest

  Amplify.configure(awsConfig)
  console.log(JSON.stringify(b))

  const d = await API.graphql(graphqlOperation(
    m.createSet, { ...b, userId: _generalUserId }
  )) as GraphQLResult<{ createSet: SetList }>

  if (!d.data?.createSet) {
    console.error(`createSet data is empty: ${JSON.stringify(d.data)}`)
    return NextResponse.json({ error: 'Internal Server Error'}, { status: 500 })
  }

  console.log(`${request.method} ${request.url} .. complete`)
  return NextResponse.json(d.data.createSet)
}
