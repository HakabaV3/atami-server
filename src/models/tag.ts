import { Model, UUID } from "./model"

export class Tag extends Model {
    id: UUID
    text: string

    downgrade() {
        return {
            id: this.id,
            text: this.text
        }
    }
}