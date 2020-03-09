import { ElephantEntity } from '../../model/elephant.entity';
import { ElephantModel } from '../../model/elephant.model';
import { Mapper } from '../../../../core/base/mapper';

export class ElephantWebRepositoryMapper extends Mapper <ElephantEntity, ElephantModel> {
  mapFrom(param: ElephantEntity): ElephantModel {
    return {
      name: param.name,
      family: param.family,
      birthday: new Date(param.birthday)
    };
  }

  mapTo(param: ElephantModel): ElephantEntity {
    return {
      id: 0,
      name: param.name,
      family: param.family,
      birthday: param.birthday.getTime()
    };
  }
}
