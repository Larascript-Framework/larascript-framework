import {
  FailedWorkerModel,
  WorkerModelAttributes,
} from "@larascript-framework/larascript-events";

export default class TestFailedWorkerModel extends FailedWorkerModel {
  public table: string = "testsWorkerFailed";

  constructor(data: WorkerModelAttributes | null = null) {
    super(data ?? ({} as WorkerModelAttributes));
  }
}
