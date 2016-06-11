import {Model, UUID} from "./model"
import {Tag} from "./tag"

export class Image extends Model {
    id: UUID
    originalUrl: string
    proxiedUrl: string
    tags: Tag[]

    downgrade() {
        return {
            id: this.id,
            originalUrl: this.originalUrl,
            proxiedUrl: this.proxiedUrl,
            tags: this.tags.map(tag => tag.text)
        }
    }
}