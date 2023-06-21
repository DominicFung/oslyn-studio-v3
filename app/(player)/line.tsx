"use client"

import { OslynPhrase } from "@/core/types"
import { getChordByNumber } from "@/core/oslyn"
import { calculateWidth, findVowels, insert, locations, substituteString } from "@/core/utils/frontend"
import { useEffect, useState } from "react"

export interface LineProps {
  phrase: OslynPhrase
  skey: string
  transpose: number

  secondary?: boolean
  textSize?: string
  decorate?: boolean
}

export default function Line(p: LineProps) {
  const [ phrase, setPhrase ] = useState<OslynPhrase>()
  
  useEffect(() => {
    if (p.phrase.lyric.trim() != "") {
      let npharse = spacer(p.phrase, p.decorate || false, p.textSize || "text-lg")
      console.log(npharse)
      setPhrase( npharse )
    } else setPhrase(p.phrase)
  }, [p.phrase, p.decorate, p.textSize, p.textSize])

  const _PAD = 10 // the amount of space you need BETWEEN chords
  const spacer = (phrase: OslynPhrase, decorate: boolean, textSize: string): OslynPhrase => {
    let pad = 0
    for (let i = 1; i<phrase.chords.length; i++) {
      phrase.chords[i].position += pad

      // is there enough room between 2 chords?
      let chord = `${ getChordByNumber(phrase.chords[i-1].chord, phrase.chords[i-1].isMinor, p.skey) }${decorate ? phrase.chords[i-1].decorator:""}`
      let lyric = phrase.lyric.substring(phrase.chords[i-1].position, phrase.chords[i].position)
      
      let chordWidth = calculateWidth(chord, textSize) + _PAD
      let textWidth = calculateWidth(lyric, textSize)
      
      console.log(`chordWidth("${chord}"): ${chordWidth} vs textWidth("${lyric}"): ${textWidth}`)

      // do padding
      // phrase.chords[i].position

      if (textWidth < chordWidth) {
        console.log(`SUBSTITUTION: ${textWidth} ${chordWidth}`)
        /** find the right place to inject spacing! By order of priority ..
         *   1. There is already a space within the lyric substring. Add more spaces there.
         *   2. There are vowels within the substring ,, add " - " there.
         *   3. no vowels -- find the middle and add " - "
        */

        const spaces = locations(" ", lyric)
        const vowels = findVowels(lyric)
        let nposition = 0
        
        let a = 0
        if (spaces.length > 0) {
          do {
            a++
            lyric = insert(lyric, spaces, "\u00A0".repeat(a))
            textWidth = calculateWidth(lyric, textSize)
          } while (textWidth < chordWidth)
          nposition = a * 2
        } else if (vowels.length > 0) {
          do {
            a++
            lyric = insert(lyric, spaces, "\u00A0".repeat(a)+"-"+"\u00A0".repeat(a))
            textWidth = calculateWidth(lyric, textSize)
          } while (textWidth < chordWidth)
          nposition = a * 2 + 1
        } else {
          console.log(`cannot find spaces or vowels in "${lyric}"`)
          let middle = Math.floor(lyric.length / 2)
          do {
            a++
            lyric = insert(lyric, [middle], "\u00A0".repeat(a)+"-"+"\u00A0".repeat(a))
            textWidth = calculateWidth(lyric, textSize)
          } while (textWidth < chordWidth)
          nposition = a * 2 + 1
        }

        pad = pad + nposition
        phrase.lyric = substituteString(phrase.lyric, lyric, phrase.chords[i-1].position, phrase.chords[i].position)
        phrase.chords[i].position = phrase.chords[i].position + nposition
      }
    }

    return phrase
  }

  return <>
    { phrase && phrase.lyric.trim() != "" && <div className="relative h-12 mt-6">
      { phrase.chords.map((c, i) => { 
        const chord = getChordByNumber(c.chord, c.isMinor, p.skey)
        const width = calculateWidth(phrase.lyric.substring(0, c.position), p.textSize  || "text-lg")
        return<span className={`absolute ${p.textSize || "text-lg"} bold ${p.secondary ? "bg-gray-700 text-gray-400" : "bg-oslyn-700 text-white" } px-1 rounded-lg`} style={{
          marginLeft: `${width}px`, left: 0, top: -24}} key={i}>{chord}{p.decorate && c.decorator}</span>
      })}
      <div className={`${p.textSize || "text-lg"} ${p.secondary ? "text-gray-400": "text-oslyn-200"} whitespace-nowrap`}>{phrase.lyric}</div>
    </div> }
    { phrase && phrase.lyric.trim() === "" && <div className="relative h-12 mt-6">
      { phrase.chords.map((c, i) => { 
        const chord = getChordByNumber(c.chord, c.isMinor, p.skey)
        
        let mLeft = 1
        if (i > 0) { mLeft = mLeft + (c.position - phrase.chords[i-1].position) * 3}
        return <span className={`${p.textSize || "text-lg"} bold ${p.secondary ? "bg-gray-700 text-gray-400" : "bg-oslyn-700 text-white" } px-1 rounded-lg`}
          style={{marginLeft: mLeft}} key={i}
        >{chord}{p.decorate && c.decorator}</span>
      })}
    </div> }
  </>
}