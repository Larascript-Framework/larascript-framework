import BaseExpression from "../../../eloquent/base/BaseExpression.js";
import Join from "./Join.js";
import Limit from "./Limit.js";
import Match from "./Match.js";
import Order from "./Order.js";
import Project from "./Project.js";
import Skip from "./Skip.js";

export type MongoRaw = object | object[];

/**
 * PipelineBuilder class for constructing MongoDB aggregation pipelines.
 * Extends BaseExpression to provide query building functionality.
 *
 * @class PipelineBuilder
 * @extends {BaseExpression<unknown>}
 */
export class AggregateExpression extends BaseExpression<unknown> {

  /** Raw MongoDB where conditions to be merged with builder conditions */
  rawWhere: MongoRaw | null = null;

  /** Raw MongoDB projections to be merged with builder projections */
  rawSelect: MongoRaw | null = null;

  /** The pipeline to build */
  pipeline: object[] = [];

  /** The pipeline stages to build */
  pipelineStages: object[] = [];

  /**
   * Builds the $project stage of the aggregation pipeline
   * @returns {object|null} The $project pipeline stage or null if no columns are specified
   */
  buildProject() {
    return Project.getPipeline(this.columns);
  }

  /**
   * Builds the $match stage of the aggregation pipeline
   * @returns {object|null} The $match pipeline stage or null if no conditions are specified
   */
  buildMatch() {
    return Match.getPipeline(this.whereClauses, this.rawWhere);
  }

  /**
   * Builds the $match stage of the aggregation pipeline as a filter object
   * @returns {object|null} The $match pipeline stage as a filter object or null if no conditions are specified
   */
  buildMatchAsFilterObject(): object | null {
    const match = Match.getPipeline(this.whereClauses, this.rawWhere)?.[
      "$match"
    ];

    if (!match) return null;

    return match as object;
  }

  /**
   * Builds the $join stage of the aggregation pipeline
   * @returns {object|null} The $join pipeline stage or null if no joins are specified
   */
  buildJoin() {
    return Join.getPipeline(this.joins);
  }

  /**
   * Builds the $limit stage of the aggregation pipeline
   * @returns {object|null} The $limit pipeline stage or null if no limit is specified
   */
  buildLimit() {
    return Limit.getPipeline(this.offsetLimit?.limit ?? null);
  }

  /**
   * Builds the $skip stage of the aggregation pipeline
   * @returns {object|null} The $skip pipeline stage or null if no offset is specified
   */
  buildSkip() {
    return Skip.getPipeline(this.offsetLimit?.offset ?? null);
  }

  /**
   * Builds the $order stage of the aggregation pipeline
   * @returns {object|null} The $order pipeline stage or null if no ordering is specified
   */
  buildOrder() {
    return Order.getPipeline(this.orderByClauses);
  }

  /**
   * Adds a pipeline stage to the builder
   * @param pipeline - The pipeline stage to add
   */
  addPipeline(pipeline: object[]): this {
    this.pipeline.push(...pipeline);
    return this;
  }

  /**
   * Sets the pipeline
   * @param pipeline - The pipeline to set
   */
  setPipeline(pipeline: object[]): this {
    this.pipeline = pipeline;
    return this;
  }

  /**
   * Gets the pipeline
   * @returns {object[]} The pipeline
   */
  getPipeline(): object[] {
    return this.pipeline;
  }

  /**
   * Adds a pipeline stage to the builder
   * @param pipeline - The pipeline stage to add
   */
  addPipelineStage(stage: object[]): this {
    this.pipelineStages.push(...stage);
    return this;
  }

  /**
   * Builds the complete MongoDB aggregation pipeline by combining all stages
   *
   * @template T - The expected return type of the pipeline
   * @returns {T} The complete aggregation pipeline array
   * @throws {ExpressionException} If the resulting pipeline is empty
   */
  build<T = unknown>(resetPipeline: boolean = true): T {
    // Reset the pipeline
    if (resetPipeline) {
      this.pipeline = [];
    }

    // Build the pipeline stages
    const match = this.buildMatch();
    const project = this.buildProject();
    const join = this.buildJoin();
    const order = this.buildOrder();
    const limit = this.buildLimit();
    const skip = this.buildSkip();

    if (match) {
      this.addPipeline([match]);
    }
    if (join) {
      this.addPipeline(join);
    }
    if (project) {
      this.addPipeline([project]);
    }
    if (order) {
      this.addPipeline([order]);
    }
    if (limit) {
      this.addPipeline([limit]);
    }
    if (skip) {
      this.addPipeline([skip]);
    }

    this.pipeline = [...this.pipeline, ...this.pipelineStages];

    return this.pipeline as T;
  }
}

export default AggregateExpression;
