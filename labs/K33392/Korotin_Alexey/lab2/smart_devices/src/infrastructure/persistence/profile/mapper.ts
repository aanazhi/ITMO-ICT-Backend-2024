import {Mapper} from "../mapper";
import {Profile} from "../../../domain/profile";
import {ProfileModel} from "./index";
import AccountMapper from "../account/mapper";
import sequelize from "../db";

export class ProfileMapper implements Mapper<Profile, ProfileModel> {

    private readonly accountMapper: AccountMapper = new AccountMapper();

    public toEntity(model: ProfileModel): Profile {
        return new Profile(model.id, model.name, model.location, this.accountMapper.toEntity(model.user));
    }

    public toModel(entity: Profile): ProfileModel {
        return sequelize.models.ProfileModel.build({
            id: entity.id,
            name: entity.name,
            location: entity.location,
            userId: entity.user.id
        }) as ProfileModel;
    }
}