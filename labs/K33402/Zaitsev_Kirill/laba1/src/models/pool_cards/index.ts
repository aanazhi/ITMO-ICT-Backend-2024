import {
    Table,
    Column,
    Model,
    Unique,
    PrimaryKey,
    AutoIncrement,
} from 'sequelize-typescript'

@Table
export class PoolCard extends Model {
    @Unique
    @PrimaryKey
    @AutoIncrement
    @Column
    identifier: number

    @Column
    name: string

    @Column
    amount_left: number
}
