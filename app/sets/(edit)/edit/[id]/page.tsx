import { headers } from 'next/headers'

import { Amplify, graphqlOperation, withSSRContext } from 'aws-amplify'
import { GraphQLResult } from "@aws-amplify/api"
import awsConfig from '@/src/aws-exports'

import * as q from '@/src/graphql/queries'
import { SetList, Song } from '@/src/API'
import SetTable from "../../../(components)/table"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Session } from "next-auth"
import Unauth from "@/app/unauthorized"

const _generalUserId = "3d7fbd91-14fa-41da-935f-704ef74d7488"

type _Session = Session & {
  userId: string
}

Amplify.configure({...awsConfig, ssr: true })

export default async function EditSets({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!(session?.user as _Session)?.userId) { return <Unauth /> }
  const userId = (session?.user as _Session)?.userId

  const req = { headers: { cookie: headers().get('cookie') } }
  const SSR = withSSRContext({ req })
  
  let d1 = [] as Song[]
  let d2: SetList|null = null

  try {
    const { data } = await SSR.API.graphql(graphqlOperation(
      q.getSet, { setListId: params.id }
    )) as GraphQLResult<{ getSet: SetList }>

    if (data?.getSet) d2 = data?.getSet
    else throw new Error("data.getSet is empty.")
  } catch (e) {
    console.log(JSON.stringify(e, null, 2))
    return <Unauth />
  }

  try {
    const { data } = await SSR.API.graphql(graphqlOperation(
      q.listSongs, { userId: userId }
    )) as GraphQLResult<{ listSongs: Song[] }>

    if (data?.listSongs) d1 = data?.listSongs
    else throw new Error("data.listSongs is empty.")
  } catch (e) {
    console.log(JSON.stringify(e, null, 2))
  }
  
  return <>
    { d2 && <SetTable songs={d1} set={d2}/> }
  </>
}