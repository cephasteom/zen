import { Merge, getDestination, Limiter } from 'tone'

// Limiter
const limiter = new Limiter({threshold: -20})

// Final destination
const destination = getDestination()
destination.channelCount = destination.maxChannelCount
destination.channelCount === 2 && destination.chain(limiter)

export const output = new Merge({channels: destination.maxChannelCount})

output.connect(destination)