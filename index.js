const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs').promises
const path = require('path')
const jsmediatags = require('jsmediatags')

const readArtistAndSong = file =>
  new Promise((resolve, reject) => {
    jsmediatags.read(file, {
      onSuccess: ({ tags }) =>
        resolve(
          tags.artist && tags.title
            ? `${tags.artist} - ${tags.title}`
            : path.basename(file, '.m4a')
        ),
      onError: reject
    })
  })

const convertM4a = () =>
  fs
    .readdir(process.cwd())
    .then(files =>
      files.filter(file => file.endsWith('m4a')).map(file =>
        readArtistAndSong(file).then(fileName =>
          ffmpeg(file)
            .audioCodec('libmp3lame')
            .outputOptions(['-aq 2', '-map_metadata 0', '-id3v2_version 3'])
            .save(path.join('mp3s', fileName + '.mp3'))
        )
      )
    )
    .catch(console.log)

fs.access(path.join(process.cwd(), 'mp3s'))
  .then(convertM4a)
  .catch(() => fs.mkdir(path.join(process.cwd(), 'mp3s')).then(convertM4a))
