import {Model, UUID} from "./model"

export class Image extends Model {
    id: UUID
    originalUrl: string
    proxiedUrl: string
    tags: string[]

    downgrade() {
        return {
            id: this.id,
            originalUrl: this.originalUrl,
            proxiedUrl: this.proxiedUrl,
            tags: this.tags
        }
    }
}