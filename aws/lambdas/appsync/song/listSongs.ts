import { AppSyncResolverEvent } from 'aws-lambda'
import { BatchGetItemCommand, DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { hasSubstring } from '../../util/dynamo'

const USER_TABLE_NAME = process.env.USER_TABLE_NAME || ''
const SONG_TABLE_NAME = process.env.SONG_TABLE_NAME || ''

export const handler = async (event: AppSyncResolverEvent<{
  userId: string, 
}, null>) => {
  console.log(event)
  const b = event.arguments
  if (!b) { console.error(`event.arguments is empty`); return }

  if (!b.userId) { console.error(`b.userId is empty`); return }

  const dynamo = new DynamoDBClient({})

  const res0 = await dynamo.send(
    new QueryCommand({
      TableName: SONG_TABLE_NAME,
      IndexName: "userId",
      KeyConditionExpression: "userId = :key",
      ExpressionAttributeValues: { ":key": { S: b.userId } }
    })
  )

  if (!res0.Items) {
    console.error(`ERROR: songs for userId not found: ${b.userId}`)
    return []
  }
  let songs = res0.Items?.map((e) => unmarshall(e))
  console.log(songs)

  if (hasSubstring(event.info.selectionSetList, "creator")) {
    console.log("getting creator (user) ...")

    const songUsers = songs.map((s) => { return s.userId as string })
    const uniq = [...new Set(songUsers)]


    const keys = uniq
    .map((s) => { return { userId: { S: s } } as { [userId: string]: any } })
    console.log(keys)

    const res1 = await dynamo.send(new BatchGetItemCommand({
      RequestItems: {[USER_TABLE_NAME]: { Keys: keys }}
    }))
    console.log(res1)
    if (!res1.Responses) { console.error(`ERROR: unable to BatchGet userId. ${res1.$metadata}`); return  } 
    
    const users = res1.Responses![USER_TABLE_NAME].map((u) => unmarshall(u))
    console.log(users)
    songs = merge(songs, users, 'userId', 'creator')
  }

  console.log(songs)
  return songs
}


/**
 * 
 * @param a1 
 * @param a2 
 * @param matchKey 
 * @param outputKey 
 * @returns 
 */
const merge = (a1: any, a2: any, matchKey: string, outputKey?: string) => {
  return a1.map((o1: any) => {
    const matchingObj = a2.find((o2: any) => o2[matchKey] === o1[matchKey])
    if (!outputKey)  return matchingObj ? { ...o1, ...matchingObj } : o1
    else return matchingObj ? { ...o1, [outputKey]: matchingObj } : o1
  })
}