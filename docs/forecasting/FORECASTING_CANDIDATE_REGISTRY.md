# Market AI Forecasting Candidate Registry

Last reviewed: 2026-07-16

Registry schema version: 1.0

Human-readable authority: this document.

Machine-readable derivative: [forecasting_candidate_registry.yaml](forecasting_candidate_registry.yaml).

The YAML file is a derivative for validation and tooling. It does not establish independent governance authority and cannot override this document or the ratified Phase R.5.3 constitutional baseline.

## 1. Purpose and Constitutional Scope

This registry controls research consideration of forecasting models, statistical baselines, trained neural baselines, risk and data-quality methods, and forecast-reconciliation components for Market AI. It prevents research names from becoming an uncontrolled dependency list, distinguishes models from libraries, methods, workflows, and reconciliation layers, preserves dispositions, and defines shared research contracts and implementation order.

This task and registry do not approve any candidate for production, Promotion, Certification, Operational Authorization, release, customer use, training, model download, package installation, inference, database work, or infrastructure work.

Mandatory interpretation:

- Registration is not approval.
- Selection for a proof of concept is not Certification.
- Benchmark success is not Promotion.
- Local inference is not production authorization.
- A license entry is not legal advice.
- All licenses must be reverified before implementation and release.
- A candidate may not acquire a stronger status merely because code was added.

### Constitutional ownership

Market AI owns reasoning, intelligence orchestration, forecasting research for market-intelligence generation, and model-adapter and benchmark planning.

AI-DATABASE retains dataset governance, provenance and lineage, certified datasets, dataset eligibility, Certification and Promotion governance, and model and training metadata governance. No database or AI-DATABASE implementation is authorized by this registry.

The embedded AI Training System retains authority for governed training, evaluation, Certification preparation, and Promotion preparation.

CMI-Systems, LLC retains final Operational Authorization, production authorization, release authority, and security authority.

### Continuing state

- Phase R.5.3: RATIFIED
- Phase S: DEFINITION-ONLY, UNAPPROVED, AND UNIMPLEMENTED
- Training: OFF
- Shadow Trainer: OFF
- Brain Learning: OFF
- Autonomous Learning: OFF
- Production: UNTOUCHED

## 2. Status Definitions

- `selected_for_staging_poc`: selected only for a bounded staging proof-of-concept proposal; implementation still requires an authorization decision.
- `registered`: recorded for governed comparison with no implementation authorization.
- `deferred`: preserved for later sequencing after prerequisites or higher-priority work.
- `watchlist`: monitored for future reassessment with no current implementation plan.
- `research_only`: restricted to non-production research consideration.
- `excluded_noncommercial`: excluded from commercial and production-bound work because of license restrictions.
- `blocked_pending_authorization`: blocked until the named governance authorization is granted.
- `implemented_unverified`: code may exist, but required verification and governance gates have not passed.
- `benchmarked`: controlled benchmark evidence exists; this is not Certification, Promotion, or Operational Authorization.
- `rejected`: evaluated and rejected with the reason preserved.
- `retired`: previously active registry entry removed from further consideration while its history is retained.

The initial registry must not use `production_approved`, `certified`, `promoted`, or `operationally_authorized`. No entry in this registry is Certified, Promoted, production-approved, or Operationally Authorized.

## 3. Candidate Summary

| Registry ID | Candidate | Category | License | Commercial status | Training required | Priority | Registry status | Implementation authorized |
|---|---|---|---|---|---|---|---|---|
| `amazon_chronos_2` | Amazon Chronos-2 | foundation_forecaster | apache-2.0 | eligible_subject_to_reverification | false | P0 | selected_for_staging_poc | false |
| `google_timesfm_2_5_200m_pytorch` | Google TimesFM 2.5 200M PyTorch | foundation_forecaster | apache-2.0 | eligible_subject_to_reverification | false | P1 | registered | false |
| `ibm_granite_ttm_r3` | IBM Granite TinyTimeMixer R3 | foundation_forecaster | apache-2.0 | eligible_subject_to_reverification | false | P1 | registered | false |
| `ibm_granite_ttm_r2_family` | IBM Granite TinyTimeMixer R2 and R2.1 | foundation_forecaster | apache-2.0 | eligible_subject_to_reverification | false | P2 | registered | false |
| `nixtla_timegpt_family` | Nixtla TimeGPT Foundation Model Family | foundation_forecaster | proprietary_commercial_terms | requires_contract_and_license_review | false | P1 | blocked_pending_authorization | false |
| `nixtla_statsforecast` | Nixtla StatsForecast | statistical_baselines | apache-2.0 | eligible_subject_to_reverification | false | P0 | registered | false |
| `statsforecast_naive` | StatsForecast Naive | statistical_baselines | apache-2.0 | eligible_subject_to_reverification | false | P0 | registered | false |
| `statsforecast_random_walk_with_drift` | StatsForecast RandomWalkWithDrift | statistical_baselines | apache-2.0 | eligible_subject_to_reverification | false | P0 | registered | false |
| `statsforecast_seasonal_naive` | StatsForecast SeasonalNaive | statistical_baselines | apache-2.0 | eligible_subject_to_reverification | false | P0 | registered | false |
| `statsforecast_auto_arima` | StatsForecast AutoARIMA | statistical_baselines | apache-2.0 | eligible_subject_to_reverification | false | P0 | registered | false |
| `statsforecast_auto_ets` | StatsForecast AutoETS | statistical_baselines | apache-2.0 | eligible_subject_to_reverification | false | P0 | registered | false |
| `statsforecast_auto_theta` | StatsForecast AutoTheta | statistical_baselines | apache-2.0 | eligible_subject_to_reverification | false | P0 | registered | false |
| `statsforecast_probabilistic_forecasting` | StatsForecast Probabilistic Forecasting | risk_uncertainty_data_quality | apache-2.0 | eligible_subject_to_reverification | false | P2 | registered | false |
| `statsforecast_conformal_prediction` | StatsForecast Conformal Prediction | risk_uncertainty_data_quality | apache-2.0 | eligible_subject_to_reverification | false | P2 | registered | false |
| `statsforecast_anomaly_detection` | StatsForecast Anomaly Detection | risk_uncertainty_data_quality | apache-2.0 | eligible_subject_to_reverification | false | P2 | registered | false |
| `statsforecast_arch` | StatsForecast ARCH | risk_uncertainty_data_quality | apache-2.0 | eligible_subject_to_reverification | false | P2 | registered | false |
| `statsforecast_garch` | StatsForecast GARCH | risk_uncertainty_data_quality | apache-2.0 | eligible_subject_to_reverification | false | P2 | registered | false |
| `residual_anomaly_detection` | Residual Anomaly Detection | risk_uncertainty_data_quality | not_applicable | not_applicable | false | P2 | registered | false |
| `prediction_interval_breach_detection` | Prediction Interval Breach Detection | risk_uncertainty_data_quality | not_applicable | not_applicable | false | P2 | registered | false |
| `cross_provider_discrepancy_detection` | Cross-Provider Discrepancy Detection | risk_uncertainty_data_quality | not_applicable | not_applicable | false | P2 | registered | false |
| `missing_and_duplicate_detection` | Missing and Duplicate Detection | risk_uncertainty_data_quality | not_applicable | not_applicable | false | P2 | registered | false |
| `corporate_action_adjustment_validation` | Corporate Action Adjustment Validation | risk_uncertainty_data_quality | not_applicable | not_applicable | false | P2 | registered | false |
| `volatility_regime_anomaly_detection` | Volatility Regime Anomaly Detection | risk_uncertainty_data_quality | not_applicable | not_applicable | false | P2 | registered | false |
| `nixtla_neuralforecast` | Nixtla NeuralForecast | trained_neural_baselines | apache-2.0 | eligible_subject_to_reverification | true | P3 | blocked_pending_authorization | false |
| `neuralforecast_nhits` | NeuralForecast NHITS | trained_neural_baselines | apache-2.0 | eligible_subject_to_reverification | true | P3 | blocked_pending_authorization | false |
| `neuralforecast_patchtst` | NeuralForecast PatchTST | trained_neural_baselines | apache-2.0 | eligible_subject_to_reverification | true | P3 | blocked_pending_authorization | false |
| `neuralforecast_nbeatsx` | NeuralForecast NBEATSx | trained_neural_baselines | apache-2.0 | eligible_subject_to_reverification | true | P3 | blocked_pending_authorization | false |
| `neuralforecast_deepar` | NeuralForecast DeepAR | trained_neural_baselines | apache-2.0 | eligible_subject_to_reverification | true | P3 | blocked_pending_authorization | false |
| `neuralforecast_tft` | NeuralForecast TFT | trained_neural_baselines | apache-2.0 | eligible_subject_to_reverification | true | P3 | blocked_pending_authorization | false |
| `nixtla_hierarchicalforecast` | Nixtla HierarchicalForecast | forecast_reconciliation | apache-2.0 | eligible_subject_to_reverification | false | P3 | deferred | false |
| `hierarchicalforecast_bottom_up` | HierarchicalForecast BottomUp | forecast_reconciliation | apache-2.0 | eligible_subject_to_reverification | false | P3 | deferred | false |
| `hierarchicalforecast_top_down` | HierarchicalForecast TopDown | forecast_reconciliation | apache-2.0 | eligible_subject_to_reverification | false | P3 | deferred | false |
| `hierarchicalforecast_middle_out` | HierarchicalForecast MiddleOut | forecast_reconciliation | apache-2.0 | eligible_subject_to_reverification | false | P3 | deferred | false |
| `hierarchicalforecast_min_trace` | HierarchicalForecast MinTrace | forecast_reconciliation | apache-2.0 | eligible_subject_to_reverification | false | P3 | deferred | false |
| `hierarchicalforecast_erm` | HierarchicalForecast ERM | forecast_reconciliation | apache-2.0 | eligible_subject_to_reverification | false | P3 | deferred | false |
| `hierarchicalforecast_normality` | HierarchicalForecast Normality | forecast_reconciliation | apache-2.0 | eligible_subject_to_reverification | false | P3 | deferred | false |
| `hierarchicalforecast_bootstrap` | HierarchicalForecast Bootstrap | forecast_reconciliation | apache-2.0 | eligible_subject_to_reverification | false | P3 | deferred | false |
| `hierarchicalforecast_permbu` | HierarchicalForecast PERMBU | forecast_reconciliation | apache-2.0 | eligible_subject_to_reverification | false | P3 | deferred | false |
| `hierarchicalforecast_conformal` | HierarchicalForecast Conformal | forecast_reconciliation | apache-2.0 | eligible_subject_to_reverification | false | P3 | deferred | false |
| `hierarchicalforecast_temporal_reconciliation` | HierarchicalForecast Temporal Reconciliation | forecast_reconciliation | apache-2.0 | eligible_subject_to_reverification | false | P3 | deferred | false |
| `hierarchicalforecast_exogenous_variable_reconciliation` | HierarchicalForecast Exogenous-Variable Reconciliation | forecast_reconciliation | apache-2.0 | eligible_subject_to_reverification | false | P3 | deferred | false |
| `hierarchicalforecast_reconciliation_diagnostics` | HierarchicalForecast Reconciliation Diagnostics | forecast_reconciliation | apache-2.0 | eligible_subject_to_reverification | false | P3 | deferred | false |
| `hierarchicalforecast_forecasting_at_scale` | HierarchicalForecast Forecasting at Scale | forecast_reconciliation | apache-2.0 | eligible_subject_to_reverification | false | P3 | deferred | false |
| `hierarchicalforecast_neural_mlforecast_integration` | HierarchicalForecast NeuralForecast and MLForecast Integration | forecast_reconciliation | apache-2.0 | eligible_subject_to_reverification | requires_verification | P3 | deferred | false |
| `statsforecast_mstl` | StatsForecast MSTL | deferred_specialists | apache-2.0 | eligible_subject_to_reverification | false | P4 | deferred | false |
| `statsforecast_mfles` | StatsForecast MFLES | deferred_specialists | apache-2.0 | eligible_subject_to_reverification | false | P4 | deferred | false |
| `statsforecast_tbats` | StatsForecast TBATS | deferred_specialists | apache-2.0 | eligible_subject_to_reverification | false | P4 | deferred | false |
| `multiple_seasonality_workflows` | Multiple-Seasonality Workflows | deferred_specialists | apache-2.0 | eligible_subject_to_reverification | false | P4 | deferred | false |
| `intermittent_sparse_data_forecasting` | Intermittent or Sparse-Data Forecasting | deferred_specialists | apache-2.0 | eligible_subject_to_reverification | false | P4 | deferred | false |
| `trajectory_simulation` | Trajectory Simulation | deferred_specialists | apache-2.0 | eligible_subject_to_reverification | false | P4 | deferred | false |
| `demand_peak_detection` | Demand-Peak Detection | deferred_specialists | apache-2.0 | eligible_subject_to_reverification | false | P4 | deferred | false |
| `electricity_load_forecasting` | Electricity-Load Forecasting | deferred_specialists | apache-2.0 | eligible_subject_to_reverification | false | P4 | deferred | false |
| `mlflow_experiment_integration` | MLflow Experiment Integration | deferred_specialists | requires_verification | requires_verification | false | P4 | deferred | false |
| `salesforce_moirai_2_r_small` | Salesforce Moirai 2.0 R Small | foundation_forecaster_watchlist | cc-by-nc-4.0 | blocked_noncommercial | false | none | excluded_noncommercial | false |
| `lag_llama` | Lag-Llama | foundation_forecaster_watchlist | apache-2.0 | eligible_subject_to_reverification | false | P4 | watchlist | false |

### Registry field rules

Every detailed record below contains or inherits the common registry fields represented in the YAML derivative: identity, provider, category, component type, upstream artifact, package or repository, official sources, license and verification date, commercial eligibility, execution and capability fields, context and horizon constraints, dependency group, adapter plan, priority, status, authorization booleans, known constraints, evaluation requirements, source-reverification requirement, and notes.

For every entry in this version:

- `license_verification_date`: `2026-07-16`
- `implementation_authorized`: `false`
- `training_authorized`: `false`
- `production_authorized`: `false`
- `source_reverification_required`: `true`

The controlled values `unknown`, `not_applicable`, and `requires_verification` are intentional. They prevent unsupported capability claims.

## 4. Foundation-Model Entries

### Official foundation source sets

- Chronos: [model card](https://huggingface.co/amazon/chronos-2) and [official repository](https://github.com/amazon-science/chronos-forecasting).
- TimesFM: [model card](https://huggingface.co/google/timesfm-2.5-200m-pytorch) and [official repository](https://github.com/google-research/timesfm).
- Granite TTM-R3: [model card](https://huggingface.co/ibm-granite/granite-timeseries-ttm-r3) and [official repository](https://github.com/ibm-granite/granite-tsfm).
- Granite TTM-R2/R2.1: [model card](https://huggingface.co/ibm-granite/granite-timeseries-ttm-r2) and [official repository](https://github.com/ibm-granite/granite-tsfm).
- TimeGPT: [foundation-model overview](https://www.nixtla.io/docs/introduction/about_timegpt), [TimeGPT-2 family quickstart](https://www.nixtla.io/docs/forecasting/timegpt_2_family), [SDK reference](https://www.nixtla.io/docs/reference/sdk_reference), [Financial Markets use case](https://www.nixtla.io/industries/financial-markets), [privacy notice](https://www.nixtla.io/docs/about/privacy-notice), [terms and conditions](https://www.nixtla.io/docs/about/terms-and-conditions), [TimeGPT-2 announcement](https://www.nixtla.io/blog/timegpt-2-announcement), [TimeGPT-2.1 announcement](https://www.nixtla.io/blog/timegpt-2-1-announcement), and [GenAI waitlist](https://www.nixtla.io/genai-waitlist).

Component distinction: StatsForecast is an open-source statistical forecasting library; NeuralForecast is an open-source trained-neural forecasting library; HierarchicalForecast is an open-source reconciliation library; TimeGPT is a proprietary foundation-model service.

### `amazon_chronos_2` - Amazon Chronos-2

- Identity: `provider=Amazon`; `category=foundation_forecaster`; `component_type=pretrained_model`; `upstream_artifact_id=amazon/chronos-2`; `package_or_repository=chronos-forecasting`; `official_source_urls=Chronos source set`.
- License: `apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`; verification date and source-reverification rule are the registry-wide values above.
- Execution: `execution_mode=[local_cpu, local_gpu]`; `cpu_support=true`; `gpu_support=true`; no execution is authorized by registration.
- Capabilities: `training_required=false`; `zero_shot_supported=true`; `point_forecast_supported=true`; `probabilistic_output=true`; `native_quantile_support=true`; `multivariate_support=true`; `past_covariate_support=true`; `future_covariate_support=true`; `exogenous_variable_support=true`.
- Context and horizon: upstream context limits require implementation-time verification. The initial target is deterministic synthetic financial-style data with five series, approximately 250 observations per series, and `initial_forecast_horizon=5_periods`.
- Plan: `dependency_group=chronos`; `planned_adapter=chronos_2_adapter`; `implementation_priority=P0`; `registry_status=selected_for_staging_poc`.
- Authorization: `implementation_authorized=false`; `training_authorized=false`; `production_authorized=false`.
- Known constraints: selection is only for a proposed local CPU staging proof of concept. This registry does not authorize package installation, model download, inference, production use, SageMaker use, or other infrastructure work.
- Evaluation requirements: five-period horizon; quantiles 0.1, 0.5, and 0.9; local CPU; deterministic fixture; walk-forward comparison against StatsForecast naive and conventional baselines.
- Notes: documented capabilities include zero-shot univariate and multivariate forecasting, past and known-future covariates, point and quantile forecasts, and CPU/GPU inference.

### `google_timesfm_2_5_200m_pytorch` - Google TimesFM 2.5 200M PyTorch

- Identity: `provider=Google Research`; `category=foundation_forecaster`; `component_type=pretrained_model`; `upstream_artifact_id=google/timesfm-2.5-200m-pytorch`; `package_or_repository=timesfm`; `official_source_urls=TimesFM source set`.
- License: `apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`; verification date and source-reverification rule are the registry-wide values above.
- Execution: `execution_mode=[local_cpu_requires_benchmark, local_gpu]`; `cpu_support=true`; `gpu_support=true`.
- Capabilities: `training_required=false`; `zero_shot_supported=true`; `point_forecast_supported=true`; `probabilistic_output=true`; `native_quantile_support=true`; `multivariate_support=requires_verification`; `past_covariate_support=requires_verification`; `future_covariate_support=requires_verification`; `exogenous_variable_support=requires_verification`.
- Context and horizon: configurable context and horizon are documented, but the selected adapter limits and continuous-quantile-head behavior require verification; `initial_forecast_horizon=5_periods`.
- Plan: `dependency_group=timesfm`; `planned_adapter=timesfm_2_5_adapter`; `implementation_priority=P1`; `registry_status=registered`.
- Authorization: `implementation_authorized=false`; `training_authorized=false`; `production_authorized=false`.
- Known constraints: installation and packaging guidance has changed over time. It must be reverified at implementation and must not be assumed to match Chronos.
- Evaluation requirements: benchmark local CPU compatibility; verify point and quantile output shapes, configured horizon, quantile-head behavior, and quantile crossing.
- Notes: the official repository currently documents TimesFM 2.5 package options while the model card contains older installation guidance; the current official implementation instructions must be rechecked at the authorization gate.

### `ibm_granite_ttm_r3` - IBM Granite TinyTimeMixer R3

- Identity: `provider=IBM Granite`; `category=foundation_forecaster`; `component_type=pretrained_model_family`; `upstream_artifact_id=ibm-granite/granite-timeseries-ttm-r3`; `package_or_repository=granite-tsfm`; `official_source_urls=Granite TTM-R3 source set`.
- License: `apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`; verification date and source-reverification rule are the registry-wide values above.
- Execution: `execution_mode=[local_cpu_requires_benchmark, local_gpu]`; `cpu_support=true`; `gpu_support=true`.
- Capabilities: `training_required=false` for initial zero-shot evaluation; `zero_shot_supported=true`; `point_forecast_supported=true`; `probabilistic_output=true`; `native_quantile_support=requires_verification`; `multivariate_support=true`; `past_covariate_support=requires_verification`; `future_covariate_support=requires_verification`; `exogenous_variable_support=true`.
- Context and horizon: checkpoint, expert routing, history, and adapter output contracts require verification; `initial_forecast_horizon=5_periods`.
- Plan: `dependency_group=granite_ttm_r3`; `planned_adapter=granite_ttm_r3_adapter`; `implementation_priority=P1`; `registry_status=registered`.
- Authorization: `implementation_authorized=false`; `training_authorized=false`; `production_authorized=false`.
- Known constraints: the family supports routing or expert selection. Native 0.1, 0.5, and 0.9 quantile compatibility is not asserted until the selected checkpoint and adapter output are verified.
- Evaluation requirements: verify zero-shot, few-shot, fine-tuning, multivariate, exogenous/control-variable, expert-selection, and output-mode claims for the exact release; benchmark CPU.
- Notes: few-shot adaptation and fine-tuning are documented capabilities but remain unauthorized.

### `ibm_granite_ttm_r2_family` - IBM Granite TinyTimeMixer R2 and R2.1

- Identity: `provider=IBM Granite`; `category=foundation_forecaster`; `component_type=pretrained_model_family`; `upstream_artifact_id=ibm-granite/granite-timeseries-ttm-r2`; `package_or_repository=granite-tsfm`; `official_source_urls=Granite TTM-R2/R2.1 source set`.
- License: `apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`; verification date and source-reverification rule are the registry-wide values above.
- Execution: `execution_mode=[local_cpu, local_gpu]`; `cpu_support=true`; `gpu_support=true`.
- Capabilities: `training_required=false` for initial zero-shot evaluation; `zero_shot_supported=true`; `point_forecast_supported=true`; `probabilistic_output=requires_verification`; `native_quantile_support=requires_verification`; `multivariate_support=true`; `past_covariate_support=requires_verification`; `future_covariate_support=requires_verification`; `exogenous_variable_support=true`.
- Context and horizon: R2 and R2.1 checkpoints are within one family. Branch/checkpoint selection depends on context length, prediction length, frequency, and release. Common contexts may require 512 or 1,024 observations. R2.1 adds daily and weekly support. `initial_forecast_horizon=5_periods`.
- Plan: `dependency_group=granite_ttm_r2`; `planned_adapter=granite_ttm_r2_adapter`; `implementation_priority=P2`; `registry_status=registered`.
- Authorization: `implementation_authorized=false`; `training_authorized=false`; `production_authorized=false`.
- Known constraints: documented use is primarily point forecasting; use the upstream supported selection process; never zero-pad to fabricate required history.
- Evaluation requirements: five synthetic series; at least 1,024 observations per series when required by the selected checkpoint; five-period horizon; CPU benchmark; exact release branch recorded.
- Notes: the selected release, branch, checkpoint, context, and prediction length must be preserved in benchmark evidence.

### `nixtla_timegpt_family` - Nixtla TimeGPT Foundation Model Family

- Identity: `provider=Nixtla`; `category=foundation_forecaster`; `component_type=proprietary_foundation_model_service`; `upstream_artifact_id=nixtla/timegpt-family`; `package_or_repository=nixtla`; `official_source_urls=TimeGPT source set`.
- License: `proprietary_commercial_terms`; `commercial_eligibility=requires_contract_and_license_review`; `license_verification_date=2026-07-16`; `source_reverification_required=true`. This entry is not legal advice, and service, SDK, model, deployment, and enterprise terms must be reverified before implementation or release.
- Execution and access: `execution_mode=[hosted_api, managed_cloud, self_hosted_enterprise]`; self-hosted access must not be assumed to be generally available without a qualifying enterprise agreement. Early-access or commercial access may require Nixtla approval. CMI-Systems, LLC has joined the Nixtla GenAI waitlist, but waitlist enrollment establishes neither access rights nor implementation authorization. Exact model versions available to an account require verification.
- Model-family variants requiring implementation-time verification: TimeGPT-1, TimeGPT-1 long-horizon variant, TimeGPT-2, and TimeGPT-2.1. These variants must not be assumed to share account availability, contract terms, endpoints, execution modes, hardware requirements, or pricing plans.
- Capabilities: `training_required=false` for initial zero-shot evaluation; `zero_shot_supported=true`; `point_forecast_supported=true`; `probabilistic_output=prediction_intervals`; `native_quantile_support=requires_verification`; `multivariate_support=requires_verification`; `past_covariate_support=requires_verification`; `future_covariate_support=requires_verification`; `exogenous_variable_support=true`; `cpu_support=requires_verification`; `gpu_support=requires_verification`. Optional fine-tuning or adaptation may exist but remains unauthorized.
- Context and horizon: model-specific history, context, horizon, request-size, endpoint, and account limits require verification; `initial_forecast_horizon=requires_verification`.
- Plan: `dependency_group=timegpt`; `planned_adapter=timegpt_adapter`; `implementation_priority=P1`; `registry_status=blocked_pending_authorization`. Priority is planning metadata only and does not alter the authorized implementation sequence.
- Authorization: `implementation_authorized=false`; `training_authorized=false`; `production_authorized=false`.
- Financial Markets supporting use case: Nixtla describes return, volatility, price and spread, volume and liquidity, correlation, and cross-venue forecasting, plus portfolio-construction support, hedging and risk-management support, execution planning, and product analytics. These are vendor-described use cases, not approved Market AI use cases, and they authorize no trading, portfolio management, order execution, or customer deployment. The Financial Markets page is supporting evidence for this family entry, not a separate candidate.
- Vendor-reported claims, not independently verified by Market AI: the Financial Markets page displays claims concerning accuracy improvement, compute-cost reduction, code reduction, deployment speed, and operational efficiency. These claims are not Market AI benchmark evidence and are excluded from benchmark-result fields.
- Known constraints:
  - Proprietary commercial terms, model access, and version availability require review and verification.
  - API pricing, rate limits, and forecast, token, or other usage costs require verification and measurement.
  - Hosted-service privacy, retention, financial-data confidentiality, processing-location, and data-residency terms require review.
  - API-key governance is required before any implementation.
  - Model-version pinning, reproducibility, service availability, and failure behavior require verification and testing.
  - Self-hosted enterprise availability, agreement terms, hardware requirements, and pricing require verification.
  - Prediction intervals must not be mislabeled as native quantiles, and native 0.1, 0.5, and 0.9 quantiles are not asserted.
  - Proprietary or governed datasets must not be transmitted to a hosted service without separate data-governance authorization.
  - Initial hosted testing, if separately authorized, must use synthetic or explicitly approved public data.
- Evaluation requirements: verify the contracted model version, endpoint, execution mode, access rights, input/output semantics, context and horizon limits, and interval behavior; compare point accuracy and interval coverage against naive and conventional baselines in controlled walk-forward evaluation; measure inference time, failure rate, reproducibility, request limits, and forecast or usage costs; complete privacy, security, confidentiality, processing-location, retention, and data-residency review before transmitting any governed data.
- Notes: registration is not approval; vendor documentation is not Market AI benchmark evidence; waitlist enrollment is not product access; local research organization is not Certification, Promotion, or Operational Authorization.

## 5. Statistical-Baseline Entries

Official sources for every entry in this section are the [StatsForecast repository](https://github.com/Nixtla/statsforecast) and [StatsForecast documentation](https://nixtlaverse.nixtla.io/statsforecast/).

Shared statistical rules:

- Point forecasts and prediction intervals remain separate.
- A point forecast is not automatically `q_0_5`.
- Interval bounds are not native quantiles unless the upstream method defines them that way.
- Every statistical model participates in controlled walk-forward validation.
- Evaluate nonseasonal and five-trading-day configurations where applicable; never assume five-day seasonality improves daily return forecasts.
- Statistical fitting during evaluation is not treated as governed neural training authorization.

### `nixtla_statsforecast` - Nixtla StatsForecast

- Identity: `provider=Nixtla`; `category=statistical_baselines`; `component_type=forecasting_library`; `upstream_artifact_id=null`; `package_or_repository=statsforecast`; `official_source_urls=StatsForecast source set`.
- License: `apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`; verification date and source-reverification rule are the registry-wide values above.
- Execution and capabilities: `execution_mode=[local_cpu]`; `training_required=false`; `zero_shot_supported=not_applicable`; `point_forecast_supported=true`; `probabilistic_output=true`; `native_quantile_support=requires_verification`; `multivariate_support=false`; `past_covariate_support=requires_verification`; `future_covariate_support=requires_verification`; `exogenous_variable_support=true`; `cpu_support=true`; `gpu_support=not_applicable`.
- Context and horizon: method-specific history and seasonality constraints apply; `initial_forecast_horizon=5_periods`.
- Plan and status: `dependency_group=statsforecast`; `planned_adapter=statsforecast_adapter`; `implementation_priority=P0`; `registry_status=registered`.
- Authorization: `implementation_authorized=false`; `training_authorized=false`; `production_authorized=false`.
- Known constraints and evaluation: this is a library component, not one forecast model. Child behavior is evaluated separately in walk-forward windows with point, interval, and verified quantile semantics preserved.
- Notes: parent library for the baseline models and selected risk workflows below.

### `statsforecast_naive` - StatsForecast Naive

- Identity and source: `provider=Nixtla`; `category=statistical_baselines`; `component_type=statistical_model`; `upstream_artifact_id=statsforecast.models.Naive`; `package_or_repository=statsforecast`; `official_source_urls=StatsForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; `point_forecast_supported=true`; `probabilistic_output=true`; `native_quantile_support=false`; `multivariate_support=false`; covariate fields are `requires_verification`; `exogenous_variable_support=false`.
- Execution and plan: `execution_mode=[local_cpu]`; `cpu_support=true`; `gpu_support=not_applicable`; minimum-history rules apply; `initial_forecast_horizon=5_periods`; `dependency_group=statsforecast`; `planned_adapter=statsforecast_adapter`; `implementation_priority=P0`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: primary nonseasonal naive benchmark; preserve point/interval semantics; use walk-forward validation.
- Notes: license date and source reverification use the registry-wide values.

### `statsforecast_random_walk_with_drift` - StatsForecast RandomWalkWithDrift

- Identity and source: `provider=Nixtla`; `category=statistical_baselines`; `component_type=statistical_model`; `upstream_artifact_id=statsforecast.models.RandomWalkWithDrift`; `package_or_repository=statsforecast`; `official_source_urls=StatsForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; `point_forecast_supported=true`; `probabilistic_output=true`; `native_quantile_support=false`; `multivariate_support=false`; covariate fields are `requires_verification`; `exogenous_variable_support=false`.
- Execution and plan: `execution_mode=[local_cpu]`; `cpu_support=true`; `gpu_support=not_applicable`; minimum-history rules apply; `initial_forecast_horizon=5_periods`; `dependency_group=statsforecast`; `planned_adapter=statsforecast_adapter`; `implementation_priority=P0`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: conventional drift baseline; preserve point/interval semantics; use walk-forward validation.
- Notes: license date and source reverification use the registry-wide values.

### `statsforecast_seasonal_naive` - StatsForecast SeasonalNaive

- Identity and source: `provider=Nixtla`; `category=statistical_baselines`; `component_type=statistical_model`; `upstream_artifact_id=statsforecast.models.SeasonalNaive`; `package_or_repository=statsforecast`; `official_source_urls=StatsForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; `point_forecast_supported=true`; `probabilistic_output=true`; `native_quantile_support=false`; `multivariate_support=false`; covariate fields are `requires_verification`; `exogenous_variable_support=false`.
- Execution and plan: `execution_mode=[local_cpu]`; `cpu_support=true`; `gpu_support=not_applicable`; sufficient seasonal history is required; initial season length is five trading days; `initial_forecast_horizon=5_periods`; `dependency_group=statsforecast`; `planned_adapter=statsforecast_adapter`; `implementation_priority=P0`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: compare with nonseasonal Naive in walk-forward evaluation; no improvement is assumed; preserve point/interval semantics.
- Notes: license date and source reverification use the registry-wide values.

### `statsforecast_auto_arima` - StatsForecast AutoARIMA

- Identity and source: `provider=Nixtla`; `category=statistical_baselines`; `component_type=statistical_model`; `upstream_artifact_id=statsforecast.models.AutoARIMA`; `package_or_repository=statsforecast`; `official_source_urls=StatsForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; `point_forecast_supported=true`; `probabilistic_output=true`; `native_quantile_support=false`; `multivariate_support=false`; covariate fields are `requires_verification`; `exogenous_variable_support=true`.
- Execution and plan: `execution_mode=[local_cpu]`; `cpu_support=true`; `gpu_support=not_applicable`; history and seasonality rules apply; `initial_forecast_horizon=5_periods`; `dependency_group=statsforecast`; `planned_adapter=statsforecast_adapter`; `implementation_priority=P0`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: evaluate nonseasonal and five-trading-day configurations where supported; walk-forward validation; preserve point/interval semantics.
- Notes: license date and source reverification use the registry-wide values.

### `statsforecast_auto_ets` - StatsForecast AutoETS

- Identity and source: `provider=Nixtla`; `category=statistical_baselines`; `component_type=statistical_model`; `upstream_artifact_id=statsforecast.models.AutoETS`; `package_or_repository=statsforecast`; `official_source_urls=StatsForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; `point_forecast_supported=true`; `probabilistic_output=true`; `native_quantile_support=false`; `multivariate_support=false`; covariate fields are `requires_verification`; `exogenous_variable_support=false`.
- Execution and plan: `execution_mode=[local_cpu]`; `cpu_support=true`; `gpu_support=not_applicable`; history and seasonality rules apply; `initial_forecast_horizon=5_periods`; `dependency_group=statsforecast`; `planned_adapter=statsforecast_adapter`; `implementation_priority=P0`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: evaluate nonseasonal and five-trading-day configurations where supported; walk-forward validation; preserve point/interval semantics.
- Notes: license date and source reverification use the registry-wide values.

### `statsforecast_auto_theta` - StatsForecast AutoTheta

- Identity and source: `provider=Nixtla`; `category=statistical_baselines`; `component_type=statistical_model`; `upstream_artifact_id=statsforecast.models.AutoTheta`; `package_or_repository=statsforecast`; `official_source_urls=StatsForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; `point_forecast_supported=true`; `probabilistic_output=true`; `native_quantile_support=false`; `multivariate_support=false`; covariate fields are `requires_verification`; `exogenous_variable_support=false`.
- Execution and plan: `execution_mode=[local_cpu]`; `cpu_support=true`; `gpu_support=not_applicable`; history and seasonality rules apply; `initial_forecast_horizon=5_periods`; `dependency_group=statsforecast`; `planned_adapter=statsforecast_adapter`; `implementation_priority=P0`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: evaluate nonseasonal and five-trading-day configurations where supported; walk-forward validation; preserve point/interval semantics.
- Notes: license date and source reverification use the registry-wide values.

## 6. Risk, Uncertainty, and Data-Quality Entries

StatsForecast-backed entries use the official StatsForecast source set in Section 5. Internal Market AI methods have `upstream_artifact_id=null`, `package_or_repository=null`, `official_source_urls=[]`, `license=not_applicable`, and `commercial_eligibility=not_applicable`; their source and capability definitions still require explicit change-control review.

Rules for every anomaly-detection or anomaly-handling entry:

- Detected anomalies are flagged, not automatically deleted.
- Raw observations remain immutable.
- Corrections create traceable derived data.
- A market shock may be a valid event rather than bad data.
- Anomaly handling preserves provenance.
- Forecast evaluation compares `raw_series`, `anomaly_flagged_series`, and `governed_repaired_series`.
- No database or AI-DATABASE implementation is authorized by this registry.

### `statsforecast_probabilistic_forecasting` - StatsForecast Probabilistic Forecasting

- Identity and source: `provider=Nixtla`; `category=risk_uncertainty_data_quality`; `component_type=probabilistic_forecasting_workflow`; `upstream_artifact_id=null`; `package_or_repository=statsforecast`; `official_source_urls=StatsForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; `point_forecast_supported=true`; `probabilistic_output=true`; `native_quantile_support=requires_verification`; `multivariate_support=false`; covariate and exogenous fields are `requires_verification`.
- Execution and plan: `execution_mode=[local_cpu]`; `cpu_support=true`; `gpu_support=not_applicable`; output semantics depend on the selected statistical method; `initial_forecast_horizon=5_periods`; `dependency_group=statsforecast`; `planned_adapter=statsforecast_uncertainty_adapter`; `implementation_priority=P2`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: intervals and quantiles remain distinct; a point forecast is not a median by default; evaluate coverage, width, verified pinball loss, and quantile crossing where applicable.
- Notes: this is a workflow under StatsForecast, not a foundation model; verification date and source reverification use the registry-wide values.

### `statsforecast_conformal_prediction` - StatsForecast Conformal Prediction

- Identity and source: `provider=Nixtla`; `category=risk_uncertainty_data_quality`; `component_type=uncertainty_method`; `upstream_artifact_id=null`; `package_or_repository=statsforecast`; `official_source_urls=StatsForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; `point_forecast_supported=false`; `probabilistic_output=true`; `native_quantile_support=false`; `multivariate_support=requires_verification`; covariate and exogenous fields are `not_applicable`.
- Execution and plan: `execution_mode=[local_cpu]`; `cpu_support=true`; `gpu_support=not_applicable`; calibration windows and exchangeability assumptions require verification; `initial_forecast_horizon=inherited_from_base_forecast`; `dependency_group=statsforecast`; `planned_adapter=statsforecast_conformal_adapter`; `implementation_priority=P2`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: conformal intervals remain intervals, not native quantiles; evaluate empirical coverage, width, calibration-window sensitivity, and regime stability.
- Notes: method under the StatsForecast parent; verification date and source reverification use the registry-wide values.

### `statsforecast_anomaly_detection` - StatsForecast Anomaly Detection

- Identity and source: `provider=Nixtla`; `category=risk_uncertainty_data_quality`; `component_type=anomaly_detection_workflow`; `upstream_artifact_id=null`; `package_or_repository=statsforecast`; `official_source_urls=StatsForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; forecast and quantile fields are `not_applicable` or `false`; `multivariate_support=requires_verification`; covariate and exogenous fields are `not_applicable`.
- Execution and plan: `execution_mode=[local_cpu]`; `cpu_support=true`; `gpu_support=not_applicable`; sufficient in-sample history is required; `initial_forecast_horizon=not_applicable`; `dependency_group=statsforecast`; `planned_adapter=statsforecast_anomaly_adapter`; `implementation_priority=P2`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: all anomaly rules and the three governed data views above apply; quantify false positives on valid market shocks.
- Notes: source and transformation lineage must be retained; verification date and source reverification use the registry-wide values.

### `statsforecast_arch` - StatsForecast ARCH

- Identity and source: `provider=Nixtla`; `category=risk_uncertainty_data_quality`; `component_type=volatility_model`; `upstream_artifact_id=statsforecast.models.ARCH`; `package_or_repository=statsforecast`; `official_source_urls=StatsForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; `point_forecast_supported=true` for the volatility target; `probabilistic_output=true`; `native_quantile_support=false`; `multivariate_support=false`; covariate and exogenous fields are `requires_verification`.
- Execution and plan: `execution_mode=[local_cpu]`; `cpu_support=true`; `gpu_support=not_applicable`; requires a defined volatility target, valid inputs, and sufficient history; `initial_forecast_horizon=5_periods`; `dependency_group=statsforecast`; `planned_adapter=statsforecast_volatility_adapter`; `implementation_priority=P2`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: ARCH is a volatility model and must not be compared directly with price or return point forecasters as though the target were the same; evaluate volatility loss, residuals, intervals, and regime sensitivity.
- Notes: verification date and source reverification use the registry-wide values.

### `statsforecast_garch` - StatsForecast GARCH

- Identity and source: `provider=Nixtla`; `category=risk_uncertainty_data_quality`; `component_type=volatility_model`; `upstream_artifact_id=statsforecast.models.GARCH`; `package_or_repository=statsforecast`; `official_source_urls=StatsForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; `point_forecast_supported=true` for the volatility target; `probabilistic_output=true`; `native_quantile_support=false`; `multivariate_support=false`; covariate and exogenous fields are `requires_verification`.
- Execution and plan: `execution_mode=[local_cpu]`; `cpu_support=true`; `gpu_support=not_applicable`; requires a defined volatility target, valid inputs, and sufficient history; `initial_forecast_horizon=5_periods`; `dependency_group=statsforecast`; `planned_adapter=statsforecast_volatility_adapter`; `implementation_priority=P2`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: GARCH is a volatility model and must not be compared directly with price or return point forecasters as though the target were the same; evaluate volatility loss, residuals, intervals, and regime sensitivity.
- Notes: verification date and source reverification use the registry-wide values.

### `residual_anomaly_detection` - Residual Anomaly Detection

- Identity and source: `provider=Market AI Research`; `category=risk_uncertainty_data_quality`; `component_type=anomaly_detection_method`; internal-source fields use the values stated at the start of this section.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; forecast, probabilistic, quantile, and covariate fields are `false` or `not_applicable`; `multivariate_support=requires_verification`; `cpu_support=true`; `gpu_support=not_applicable`.
- Execution and plan: `execution_mode=[research_workflow]`; requires governed residuals and an evaluation window; `initial_forecast_horizon=not_applicable`; `dependency_group=market_ai_data_quality_methods`; `planned_adapter=governed_anomaly_detection_adapter`; `implementation_priority=P2`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: all anomaly rules and data views above apply; preserve provenance and quantify false positives on valid shocks.
- Notes: `source_reverification_required=true`; internal definitions still require explicit review before implementation.

### `prediction_interval_breach_detection` - Prediction Interval Breach Detection

- Identity and source: `provider=Market AI Research`; `category=risk_uncertainty_data_quality`; `component_type=uncertainty_monitoring_method`; internal-source fields use the values stated at the start of this section.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; forecast, probabilistic, quantile, and covariate fields are `false` or `not_applicable`; `multivariate_support=requires_verification`; `cpu_support=true`; `gpu_support=not_applicable`.
- Execution and plan: `execution_mode=[research_workflow]`; requires verified interval semantics, interval level, and outcomes; `initial_forecast_horizon=not_applicable`; `dependency_group=market_ai_data_quality_methods`; `planned_adapter=prediction_interval_breach_adapter`; `implementation_priority=P2`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: all anomaly rules and data views above apply; a breach is a monitoring signal, not automatic proof of bad data or model failure.
- Notes: `source_reverification_required=true`; internal definitions still require explicit review before implementation.

### `cross_provider_discrepancy_detection` - Cross-Provider Discrepancy Detection

- Identity and source: `provider=Market AI Research`; `category=risk_uncertainty_data_quality`; `component_type=data_quality_method`; internal-source fields use the values stated at the start of this section.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; forecast, probabilistic, quantile, and covariate fields are `false` or `not_applicable`; `multivariate_support=requires_verification`; `cpu_support=true`; `gpu_support=not_applicable`.
- Execution and plan: `execution_mode=[research_workflow]`; requires time-aligned observations from separately identified providers; `initial_forecast_horizon=not_applicable`; `dependency_group=market_ai_data_quality_methods`; `planned_adapter=cross_provider_discrepancy_adapter`; `implementation_priority=P2`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: all anomaly rules and data views above apply; provider differences are flagged for review and never silently substituted.
- Notes: `source_reverification_required=true`; internal definitions still require explicit review before implementation.

### `missing_and_duplicate_detection` - Missing and Duplicate Detection

- Identity and source: `provider=Market AI Research`; `category=risk_uncertainty_data_quality`; `component_type=data_quality_method`; internal-source fields use the values stated at the start of this section.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; forecast, probabilistic, quantile, and covariate fields are `false` or `not_applicable`; `multivariate_support=requires_verification`; `cpu_support=true`; `gpu_support=not_applicable`.
- Execution and plan: `execution_mode=[research_workflow]`; requires an expected calendar or frequency and unique id/timestamp validation; `initial_forecast_horizon=not_applicable`; `dependency_group=market_ai_data_quality_methods`; `planned_adapter=missing_duplicate_detection_adapter`; `implementation_priority=P2`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: all anomaly rules and data views above apply; missing and duplicate observations remain traceable through flags and governed derived views.
- Notes: `source_reverification_required=true`; internal definitions still require explicit review before implementation.

### `corporate_action_adjustment_validation` - Corporate Action Adjustment Validation

- Identity and source: `provider=Market AI Research`; `category=risk_uncertainty_data_quality`; `component_type=data_quality_method`; internal-source fields use the values stated at the start of this section.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; forecast, probabilistic, quantile, and covariate fields are `false` or `not_applicable`; `multivariate_support=requires_verification`; `cpu_support=true`; `gpu_support=not_applicable`.
- Execution and plan: `execution_mode=[research_workflow]`; requires authoritative corporate-action provenance and explicit adjusted/unadjusted series identity; `initial_forecast_horizon=not_applicable`; `dependency_group=market_ai_data_quality_methods`; `planned_adapter=corporate_action_validation_adapter`; `implementation_priority=P2`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: all anomaly rules and data views above apply; adjustment validation must not rewrite raw provider observations.
- Notes: `source_reverification_required=true`; internal definitions still require explicit review before implementation.

### `volatility_regime_anomaly_detection` - Volatility Regime Anomaly Detection

- Identity and source: `provider=Market AI Research`; `category=risk_uncertainty_data_quality`; `component_type=risk_monitoring_method`; internal-source fields use the values stated at the start of this section.
- Capabilities: `training_required=false`; `zero_shot_supported=not_applicable`; forecast, probabilistic, quantile, and covariate fields are `false` or `not_applicable`; `multivariate_support=requires_verification`; `cpu_support=true`; `gpu_support=not_applicable`.
- Execution and plan: `execution_mode=[research_workflow]`; requires a versioned volatility-regime definition and sufficient history; `initial_forecast_horizon=not_applicable`; `dependency_group=market_ai_data_quality_methods`; `planned_adapter=volatility_regime_anomaly_adapter`; `implementation_priority=P2`; `registry_status=registered`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: all anomaly rules and data views above apply; a regime shift can be a valid market event and is not corrupt data by default.
- Notes: `source_reverification_required=true`; internal definitions still require explicit review before implementation.

## 7. Trained-Neural Entries

Official sources for every entry in this section are the [NeuralForecast repository](https://github.com/Nixtla/neuralforecast) and [NeuralForecast documentation](https://nixtlaverse.nixtla.io/neuralforecast/).

Every entry in this section requires fitting or training, is excluded from the Chronos-2 inference smoke test, remains blocked while Training is OFF, and requires a separate approved training phase. Registration does not authorize training.

### `nixtla_neuralforecast` - Nixtla NeuralForecast

- Identity and source: `provider=Nixtla`; `category=trained_neural_baselines`; `component_type=training_library`; `upstream_artifact_id=null`; `package_or_repository=neuralforecast`; `official_source_urls=NeuralForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`.
- Capabilities: `training_required=true`; `zero_shot_supported=false`; `point_forecast_supported=true`; `probabilistic_output=true`; `native_quantile_support=requires_verification`; `multivariate_support=requires_verification`; past, future, and exogenous support are `true` at the library level but require per-model verification.
- Execution and plan: `execution_mode=[local_cpu_requires_benchmark, local_gpu]`; `cpu_support=true`; `gpu_support=true`; model-specific windows, losses, scaling, and hardware requirements apply; `initial_forecast_horizon=5_periods_after_training_authorization`; `dependency_group=neuralforecast`; `planned_adapter=neuralforecast_adapter`; `implementation_priority=P3`; `registry_status=blocked_pending_authorization`.
- Authorization: all three authorization booleans are `false`.
- Constraints and evaluation: require a separately approved training phase, deterministic fixtures, dataset lineage, leakage controls, and walk-forward comparison against StatsForecast and approved foundation models.
- Notes: library parent for the five candidate models; verification date and source reverification use registry-wide values.

### Trained-neural model records

The five child entries share these full fields unless the record states otherwise: `provider=Nixtla`; `category=trained_neural_baselines`; `component_type=trained_neural_model`; `package_or_repository=neuralforecast`; `official_source_urls=NeuralForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`; `execution_mode=[local_cpu_requires_benchmark, local_gpu]`; `training_required=true`; `zero_shot_supported=false`; `point_forecast_supported=true`; probabilistic, quantile, multivariate, and all covariate fields are `requires_verification`; `cpu_support=true`; `gpu_support=true`; architecture-specific history and loss constraints apply; `initial_forecast_horizon=5_periods_after_training_authorization`; `dependency_group=neuralforecast`; `planned_adapter=neuralforecast_adapter`; `implementation_priority=P3`; `registry_status=blocked_pending_authorization`; all authorization booleans are `false`; `source_reverification_required=true`.

#### `neuralforecast_nhits` - NeuralForecast NHITS

- `upstream_artifact_id=neuralforecast.models.NHITS`; initial trained-neural priority 1 of 5.
- Known constraints: fitting is required; not part of the Chronos-2 smoke test; blocked while Training is OFF.
- Evaluation requirements: approved training phase, leakage-controlled walk-forward evaluation, reproducible seeds and configuration, and comparison with statistical and foundation baselines.
- Notes: license verification date is 2026-07-16; registration does not authorize training.

#### `neuralforecast_patchtst` - NeuralForecast PatchTST

- `upstream_artifact_id=neuralforecast.models.PatchTST`; initial trained-neural priority 2 of 5.
- Known constraints: fitting is required; not part of the Chronos-2 smoke test; blocked while Training is OFF.
- Evaluation requirements: approved training phase, leakage-controlled walk-forward evaluation, reproducible seeds and configuration, and comparison with statistical and foundation baselines.
- Notes: license verification date is 2026-07-16; registration does not authorize training.

#### `neuralforecast_nbeatsx` - NeuralForecast NBEATSx

- `upstream_artifact_id=neuralforecast.models.NBEATSx`; initial trained-neural priority 3 of 5.
- Known constraints: fitting is required; not part of the Chronos-2 smoke test; blocked while Training is OFF.
- Evaluation requirements: approved training phase, leakage-controlled walk-forward evaluation, reproducible seeds and configuration, and comparison with statistical and foundation baselines.
- Notes: license verification date is 2026-07-16; registration does not authorize training.

#### `neuralforecast_deepar` - NeuralForecast DeepAR

- `upstream_artifact_id=neuralforecast.models.DeepAR`; initial trained-neural priority 4 of 5.
- Known constraints: fitting is required; not part of the Chronos-2 smoke test; blocked while Training is OFF.
- Evaluation requirements: approved training phase, leakage-controlled walk-forward evaluation, reproducible seeds and configuration, and comparison with statistical and foundation baselines.
- Notes: license verification date is 2026-07-16; registration does not authorize training.

#### `neuralforecast_tft` - NeuralForecast TFT

- `upstream_artifact_id=neuralforecast.models.TFT`; initial trained-neural priority 5 of 5.
- Known constraints: fitting is required; not part of the Chronos-2 smoke test; blocked while Training is OFF.
- Evaluation requirements: approved training phase, leakage-controlled walk-forward evaluation, reproducible seeds and configuration, and comparison with statistical and foundation baselines.
- Notes: license verification date is 2026-07-16; registration does not authorize training.

## 8. Reconciliation Entries

Official sources for every entry in this section are the [HierarchicalForecast repository](https://github.com/Nixtla/hierarchicalforecast) and [HierarchicalForecast documentation](https://nixtlaverse.nixtla.io/hierarchicalforecast/).

HierarchicalForecast is not a base forecasting model. It consumes base forecasts and can enforce cross-sectional or temporal coherence. Every reconciliation entry is deferred until normalized base forecast adapters exist.

Conceptual market hierarchy:

1. Total Market
2. Asset Class
3. Sector
4. Industry
5. Symbol

Conceptual temporal hierarchy:

1. Monthly
2. Weekly
3. Daily
4. Intraday

Required future reconciliation fields:

- `base_forecast`
- `reconciled_forecast`
- `reconciliation_method`
- `hierarchy_version`
- `coherence_error_before`
- `coherence_error_after`

### `nixtla_hierarchicalforecast` - Nixtla HierarchicalForecast

- Identity and source: `provider=Nixtla`; `category=forecast_reconciliation`; `component_type=reconciliation_library`; `upstream_artifact_id=null`; `package_or_repository=hierarchicalforecast`; `official_source_urls=HierarchicalForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`.
- Capabilities: `training_required=false` for basic reconciliation; `zero_shot_supported=not_applicable`; forecast, quantile, multivariate, and covariate fields are `not_applicable` at the library level because it consumes base forecasts.
- Execution and plan: `execution_mode=[local_cpu]`; `cpu_support=true`; `gpu_support=not_applicable`; requires normalized base forecasts and a versioned hierarchy; `initial_forecast_horizon=inherited_from_base_forecast`; `dependency_group=hierarchicalforecast`; `planned_adapter=hierarchical_forecast_reconciliation_adapter`; `implementation_priority=P3`; `registry_status=deferred`.
- Authorization: all three authorization booleans are `false`.
- Constraints: it must follow the normalized adapter layer and must not be implemented before base forecast adapters exist.
- Evaluation requirements: preserve base and reconciled forecasts; measure coherence error before and after; test forecast-quality changes and hierarchy-version reproducibility.
- Notes: verification date is 2026-07-16 and `source_reverification_required=true`.

### Point-reconciliation method records

Each point method has these full shared fields: `provider=Nixtla`; `category=forecast_reconciliation`; `component_type=point_reconciliation_method`; `package_or_repository=hierarchicalforecast`; `official_source_urls=HierarchicalForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`; `execution_mode=[local_cpu]`; `training_required=false`; `zero_shot_supported=not_applicable`; `point_forecast_supported=true`; `probabilistic_output=false`; `native_quantile_support=false`; multivariate and covariate fields are `not_applicable`; `cpu_support=true`; `gpu_support=not_applicable`; a normalized base forecast and versioned hierarchy are required; `initial_forecast_horizon=inherited_from_base_forecast`; `dependency_group=hierarchicalforecast`; `planned_adapter=hierarchical_point_reconciliation_adapter`; `implementation_priority=P3`; `registry_status=deferred`; all authorization booleans are `false`; verification date is 2026-07-16; `source_reverification_required=true`. Evaluation must record the six future reconciliation fields and compare forecast accuracy and coherence before and after reconciliation.

#### `hierarchicalforecast_bottom_up` - HierarchicalForecast BottomUp

- `upstream_artifact_id=hierarchicalforecast.methods.BottomUp`; aggregates lower-level base forecasts upward.
- Known constraints: consumes base forecasts and cannot precede the adapter layer.
- Notes: registration is planning metadata only.

#### `hierarchicalforecast_top_down` - HierarchicalForecast TopDown

- `upstream_artifact_id=hierarchicalforecast.methods.TopDown`; allocates top-level base forecasts downward.
- Known constraints: allocation method and hierarchy semantics require verification.
- Notes: registration is planning metadata only.

#### `hierarchicalforecast_middle_out` - HierarchicalForecast MiddleOut

- `upstream_artifact_id=hierarchicalforecast.methods.MiddleOut`; reconciles upward and downward from a selected middle level.
- Known constraints: middle-level selection and allocation method require verification.
- Notes: registration is planning metadata only.

#### `hierarchicalforecast_min_trace` - HierarchicalForecast MinTrace

- `upstream_artifact_id=hierarchicalforecast.methods.MinTrace`; uses a minimum-trace reconciliation objective.
- Known constraints: covariance estimation and method configuration require verification.
- Notes: registration is planning metadata only.

#### `hierarchicalforecast_erm` - HierarchicalForecast ERM

- `upstream_artifact_id=hierarchicalforecast.methods.ERM`; uses an empirical-risk-minimization reconciliation matrix.
- Known constraints: optimization configuration and evidence requirements must be defined before implementation.
- Notes: registration is planning metadata only.

### Probabilistic-reconciliation method records

Each probabilistic method has these full shared fields: `provider=Nixtla`; `category=forecast_reconciliation`; `component_type=probabilistic_reconciliation_method`; `package_or_repository=hierarchicalforecast`; `official_source_urls=HierarchicalForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`; `execution_mode=[local_cpu]`; `training_required=false`; `zero_shot_supported=not_applicable`; `point_forecast_supported=false`; `probabilistic_output=true`; `native_quantile_support=requires_verification` unless overridden; multivariate and covariate fields are `not_applicable`; `cpu_support=true`; `gpu_support=not_applicable`; verified probabilistic base forecasts and a versioned hierarchy are required; `initial_forecast_horizon=inherited_from_base_forecast`; `dependency_group=hierarchicalforecast`; `planned_adapter=hierarchical_probabilistic_reconciliation_adapter`; `implementation_priority=P3`; `registry_status=deferred`; all authorization booleans are `false`; verification date is 2026-07-16; `source_reverification_required=true`. Evaluation must include coherence, coverage, width, calibration, and quantile crossing when verified quantiles exist.

#### `hierarchicalforecast_normality` - HierarchicalForecast Normality

- `upstream_artifact_id=hierarchicalforecast.methods.Normality`.
- Known constraints: method assumptions and variance/covariance inputs require verification; reconciled intervals or samples are not native quantiles without proof.
- Notes: probabilistic reconciliation method, not a base model.

#### `hierarchicalforecast_bootstrap` - HierarchicalForecast Bootstrap

- `upstream_artifact_id=hierarchicalforecast.methods.Bootstrap`.
- Known constraints: bootstrap sampling, reproducibility, and coverage behavior require verification.
- Notes: probabilistic reconciliation method, not a base model.

#### `hierarchicalforecast_permbu` - HierarchicalForecast PERMBU

- `upstream_artifact_id=hierarchicalforecast.methods.PERMBU`.
- Known constraints: rank-dependence reinjection and bottom-up aggregation inputs require verification.
- Notes: probabilistic reconciliation method, not a base model.

#### `hierarchicalforecast_conformal` - HierarchicalForecast Conformal

- `upstream_artifact_id=hierarchicalforecast.methods.Conformal`; `native_quantile_support=false`.
- Known constraints: register only where upstream support and exchangeability assumptions are verified; conformal intervals are not native quantiles.
- Notes: probabilistic reconciliation where supported and verified.

### Supporting reconciliation workflow records

Each supporting workflow has these full shared fields: `provider=Nixtla`; `category=forecast_reconciliation`; `package_or_repository=hierarchicalforecast`; `official_source_urls=HierarchicalForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`; `execution_mode=[local_cpu]`; `training_required=false` unless overridden; forecasting, quantile, multivariate, and covariate fields are `not_applicable` unless overridden; `cpu_support=true`; `gpu_support=not_applicable`; `initial_forecast_horizon=inherited_from_base_forecast`; `dependency_group=hierarchicalforecast`; `implementation_priority=P3`; `registry_status=deferred`; all authorization booleans are `false`; verification date is 2026-07-16; `source_reverification_required=true`. Every workflow requires stable normalized base forecasts and records the future reconciliation fields where applicable.

#### `hierarchicalforecast_temporal_reconciliation` - HierarchicalForecast Temporal Reconciliation

- `component_type=reconciliation_workflow`; `upstream_artifact_id=null`; `planned_adapter=hierarchical_temporal_reconciliation_adapter`.
- Context and constraints: requires a versioned temporal hierarchy and aligned base forecasts across Monthly, Weekly, Daily, and Intraday levels.
- Evaluation and notes: measure temporal coherence and accuracy before and after reconciliation; not a base model.

#### `hierarchicalforecast_exogenous_variable_reconciliation` - HierarchicalForecast Exogenous-Variable Reconciliation

- `component_type=reconciliation_workflow`; `upstream_artifact_id=null`; `exogenous_variable_support=requires_verification`; `planned_adapter=hierarchical_exogenous_reconciliation_adapter`.
- Context and constraints: requires verified exogenous alignment and supported reconciliation behavior; base-forecast exogenous semantics remain authoritative.
- Evaluation and notes: verify coherence without losing source/covariate traceability; not a base model.

#### `hierarchicalforecast_reconciliation_diagnostics` - HierarchicalForecast Reconciliation Diagnostics

- `component_type=diagnostics_workflow`; `upstream_artifact_id=null`; `planned_adapter=hierarchical_reconciliation_diagnostics_adapter`.
- Context and constraints: requires base forecasts, reconciled forecasts, hierarchy version, and observed outcomes.
- Evaluation and notes: tracks coherence error and forecast-quality change before and after reconciliation.

#### `hierarchicalforecast_forecasting_at_scale` - HierarchicalForecast Forecasting at Scale

- `component_type=scale_workflow`; `upstream_artifact_id=null`; `planned_adapter=hierarchical_forecasting_scale_adapter`.
- Context and constraints: requires stable adapters, bounded parallelism, reproducibility controls, and operational benchmarks.
- Evaluation and notes: scale work is deferred until single-run reconciliation is correct and stable.

#### `hierarchicalforecast_neural_mlforecast_integration` - HierarchicalForecast NeuralForecast and MLForecast Integration

- `component_type=integration_workflow`; `upstream_artifact_id=null`; `training_required=requires_verification`; `planned_adapter=hierarchical_external_forecast_integration_adapter`.
- Context and constraints: requires normalized base forecasts and separate authorization for every training dependency. Integration does not authorize NeuralForecast training or MLForecast implementation.
- Evaluation and notes: verify adapter parity and coherence only after stable base forecasts exist.

## 9. Deferred Specialists

Every deferred specialist is preserved to avoid repeated rediscovery. Unless overridden, entries in this section have: `provider=Nixtla`; `category=deferred_specialists`; `package_or_repository=statsforecast`; `official_source_urls=StatsForecast source set`; `license=apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`; `execution_mode=[local_cpu_requires_benchmark]`; `training_required=false`; `zero_shot_supported=not_applicable`; forecast, probabilistic, quantile, multivariate, and covariate fields are `requires_verification`; `cpu_support=true`; `gpu_support=not_applicable`; use-case-specific history, frequency, and seasonality requirements apply; `initial_forecast_horizon=requires_verification`; `dependency_group=statsforecast_deferred_specialists`; `planned_adapter=deferred_specialist_adapter`; `implementation_priority=P4`; `registry_status=deferred`; all authorization booleans are `false`; verification date is 2026-07-16; `source_reverification_required=true`.

These methods may later support intraday volume, liquidity, volatility, market-session effects, sparse instruments, or structured scenario simulation. Each requires a use-case-specific deterministic fixture and walk-forward benchmark.

### `statsforecast_mstl` - StatsForecast MSTL

- `component_type=multiple_seasonality_model`; `upstream_artifact_id=statsforecast.models.MSTL`.
- Known constraints: deferred until the validation, baseline, and benchmark layers are stable.
- Evaluation and notes: multiple-seasonality hypothesis must be demonstrated for the exact market target.

### `statsforecast_mfles` - StatsForecast MFLES

- `component_type=multiple_seasonality_model`; `upstream_artifact_id=statsforecast.models.MFLES`.
- Known constraints: deferred until the validation, baseline, and benchmark layers are stable.
- Evaluation and notes: multiple-seasonality hypothesis must be demonstrated for the exact market target.

### `statsforecast_tbats` - StatsForecast TBATS

- `component_type=multiple_seasonality_model`; `upstream_artifact_id=statsforecast.models.TBATS`.
- Known constraints: deferred until the validation, baseline, and benchmark layers are stable.
- Evaluation and notes: complex seasonal structure and market-session applicability require evidence.

### `multiple_seasonality_workflows` - Multiple-Seasonality Workflows

- `component_type=research_workflow`; `upstream_artifact_id=null`.
- Known constraints: deferred until stable base forecasts and a justified multi-seasonality hypothesis exist.
- Evaluation and notes: may support intraday volume, liquidity, volatility, or session effects.

### `intermittent_sparse_data_forecasting` - Intermittent or Sparse-Data Forecasting

- `component_type=specialist_forecasting_workflow`; `upstream_artifact_id=null`.
- Known constraints: sparse-series eligibility and zero-observation semantics require an explicit contract.
- Evaluation and notes: may support sparse instruments or series with few non-zero observations.

### `trajectory_simulation` - Trajectory Simulation

- `component_type=simulation_workflow`; `upstream_artifact_id=null`; `point_forecast_supported=false`; `probabilistic_output=true`.
- Known constraints: simulations must be labeled, reproducible, and separated from observed market data.
- Evaluation and notes: may support structured scenario simulation after governance and benchmark design.

### `demand_peak_detection` - Demand-Peak Detection

- `component_type=specialist_detection_workflow`; `upstream_artifact_id=null`; `point_forecast_supported=false`; `probabilistic_output=not_applicable`.
- Known constraints: domain transfer to markets requires a separate hypothesis.
- Evaluation and notes: reference workflow that may inform future volume or liquidity peak research.

### `electricity_load_forecasting` - Electricity-Load Forecasting

- `component_type=domain_reference_workflow`; `upstream_artifact_id=null`.
- Known constraints: market applicability is unproven and requires a separate use-case decision.
- Evaluation and notes: reference for seasonal and peak-demand patterns only.

### `mlflow_experiment_integration` - MLflow Experiment Integration

- Overrides: `component_type=experiment_tracking_integration`; `upstream_artifact_id=null`; `package_or_repository=requires_verification`; `license=requires_verification`; `commercial_eligibility=requires_verification`; forecast fields are `not_applicable`; `cpu_support=not_applicable`.
- Other common deferred fields, priority, status, authorizations, verification date, and source-reverification requirement remain as stated above.
- Known constraints: package, license, hosting, data-governance, and authorization requirements require independent verification.
- Evaluation and notes: experiment tracking is not model approval, Certification, Promotion, or training authorization.

## 10. Watchlist and Exclusions

### `salesforce_moirai_2_r_small` - Salesforce Moirai 2.0 R Small

- Identity and source: `provider=Salesforce AI Research`; `category=foundation_forecaster_watchlist`; `component_type=pretrained_model`; `upstream_artifact_id=Salesforce/moirai-2.0-R-small`; `package_or_repository=uni2ts`; official sources are the [model card](https://huggingface.co/Salesforce/moirai-2.0-R-small) and [official repository](https://github.com/SalesforceAIResearch/uni2ts).
- License: `cc-by-nc-4.0`; `commercial_eligibility=blocked_noncommercial`; verification date is 2026-07-16 and `source_reverification_required=true`.
- Capabilities: `training_required=false` for research-only zero-shot consideration; `zero_shot_supported=true`; `point_forecast_supported=requires_verification`; `probabilistic_output=true`; quantile, multivariate, covariate, CPU, and GPU fields are `requires_verification`.
- Execution and context: `execution_mode=[research_only_requires_separate_approval]`; exact context, target dimension, dependency, and execution requirements require verification; `initial_forecast_horizon=requires_verification`.
- Plan: `dependency_group=moirai_noncommercial_research_only`; `planned_adapter=none`; `implementation_priority=none`; `registry_status=excluded_noncommercial`.
- Authorization: `implementation_authorized=false`; `training_authorized=false`; `production_authorized=false`.
- Known constraints: this entry must remain outside production-bound and commercial Market AI work. Separate legal and licensing approval would be required before any change in disposition.
- Evaluation requirements: no commercial or production-bound evaluation, API, release, or implementation is authorized.
- Notes: research-only consideration; the model-card license and code license must be treated as separate artifacts and reverified.

### `lag_llama` - Lag-Llama

- Identity and source: `provider=Time Series Foundation Models`; `category=foundation_forecaster_watchlist`; `component_type=pretrained_model`; `upstream_artifact_id=time-series-foundation-models/Lag-Llama`; `package_or_repository=lag-llama`; official sources are the [model card](https://huggingface.co/time-series-foundation-models/Lag-Llama) and [official repository](https://github.com/time-series-foundation-models/lag-llama).
- License: `apache-2.0`; `commercial_eligibility=eligible_subject_to_reverification`; verification date is 2026-07-16 and `source_reverification_required=true`.
- Capabilities: `training_required=false` for initial zero-shot consideration; `zero_shot_supported=true`; `point_forecast_supported=requires_verification`; `probabilistic_output=true`; quantile, multivariate, covariate, CPU, and GPU fields are `requires_verification`.
- Execution and context: `execution_mode=[local_cpu_requires_benchmark, local_gpu_requires_verification]`; context length is a key integration variable and requires current-stack reevaluation; `initial_forecast_horizon=requires_verification`.
- Plan: `dependency_group=lag_llama`; `planned_adapter=lag_llama_adapter`; `implementation_priority=P4`; `registry_status=watchlist`.
- Authorization: `implementation_authorized=false`; `training_authorized=false`; `production_authorized=false`.
- Known constraints: lower immediate priority than Chronos-2, TimesFM 2.5, and Granite TTM. Context-length and integration requirements must be reevaluated before implementation.
- Evaluation requirements: reverify probabilistic outputs, context behavior, current dependencies, CPU feasibility, and walk-forward integration before any status change.
- Notes: probabilistic forecasting reference retained to avoid repeated rediscovery.

## 11. Canonical Input Contract

Market AI research inputs use these required fields:

- `id`
- `timestamp`
- `target`

Optional fields:

- `past_covariates`
- `known_future_covariates`
- `static_features`
- `hierarchy_fields`
- `data_view_identifier`
- `source_provider_identifier`

Nixtla mapping:

- `id` -> `unique_id`
- `timestamp` -> `ds`
- `target` -> `y`

Required validation principles:

- Timestamps are parseable.
- Observations are ordered within each series.
- Each `id` and `timestamp` pair is unique.
- Targets are numeric and finite.
- Identifiers are present.
- History is sufficient for the selected candidate.
- Future information does not leak into training, fitting, calibration, selection, or evaluation.
- Artificial history padding is prohibited.
- Provenance is retained for every transformed data view.

## 12. Normalized Forecast Output Contract

Proposed research output fields:

- `id`
- `timestamp`
- `model_id`
- `model_version`
- `adapter_version`
- `point_forecast`
- `q_0_1`
- `q_0_5`
- `q_0_9`
- `interval_lower`
- `interval_upper`
- `interval_level`
- `forecast_horizon`
- `execution_seconds`
- `peak_memory_mb`
- `model_cache_size_mb`
- `evaluation_window`
- `data_view`
- `run_id`
- `license`
- `registry_status`

Normalization rules:

- Unsupported fields remain `null`.
- Quantiles are never fabricated.
- Prediction intervals are never mislabeled as quantiles.
- Point forecasts are not automatically treated as medians.
- Quantile crossing is detected and reported.
- Raw provider-specific outputs remain available for traceability.

## 13. Common Evaluation Contract

### Point accuracy

- MAE
- RMSE
- MASE
- sMAPE
- Directional accuracy

### Probabilistic accuracy

- Pinball loss
- Median pinball loss
- CRPS where supported
- Interval coverage
- Interval width
- Quantile crossing rate

### Operational evidence

- Inference time
- Training time when later authorized
- Peak memory
- Model cache or download size
- CPU compatibility
- GPU requirement
- Failure rate
- Reproducibility

### Governance evidence

- License eligibility
- Source provenance
- Version pinning
- Dataset lineage
- Leakage protection
- Deterministic fixture support
- Model-card and source verification date

A candidate must beat or materially complement naive and conventional baselines in controlled walk-forward evaluation before infrastructure or deployment work is considered. Benchmark evidence alone does not authorize implementation, infrastructure, deployment, commercialization, Promotion, Certification, Operational Authorization, or production use.

## 14. Implementation Order

1. Registry and common contracts.
2. StatsForecast naive and conventional baselines.
3. Shared validation and normalized output schema.
4. Chronos-2 local CPU staging proof of concept.
5. Walk-forward benchmark harness.
6. TimesFM 2.5 adapter.
7. Granite TTM-R3 adapter.
8. Granite TTM-R2/R2.1 adapter.
9. Risk, anomaly, volatility, and conformal workflows.
10. NeuralForecast only after explicit training authorization.
11. HierarchicalForecast after stable base forecasts exist.
12. Deferred specialist research.

This order is planning metadata, not implementation authorization.

## 15. Source and License Policy

- Use official model cards, official repositories, official documentation, and published papers as primary sources.
- Search snippets, community fine-tunes, Spaces, and third-party blogs are not authoritative.
- Downloaded offline HTML pages are local research aids only.
- Downloaded HTML and asset folders must not be committed.
- Reverify licenses from official sources before implementation and before release.
- Third-party model weights and code can have different licenses and must be checked separately.
- Legal review may still be required for commercial distribution.
- A registry license entry is not legal advice.
- `source_reverification_required=true` for every external entry.

License verification on 2026-07-16 recorded Apache-2.0 for Chronos-2, TimesFM 2.5, Granite TTM-R3, Granite TTM-R2/R2.1, StatsForecast, NeuralForecast, HierarchicalForecast, and Lag-Llama from the listed official sources. The Moirai 2.0 R Small model card records CC-BY-NC-4.0 and is therefore `blocked_noncommercial` and `excluded_noncommercial`. MLflow integration remains `requires_verification` because this registry does not establish its eventual package and license composition.

## 16. Change-Control Process

Every future registry change requires:

1. An explicit registry update in this Markdown authority and its YAML derivative.
2. Official-source reverification.
3. License review, including separate model-weight and code-license review.
4. Capability verification for the exact version, checkpoint, package, adapter, and execution mode.
5. Benchmark evidence for any proposed status promotion.
6. An explicit authorization decision before implementation.
7. Certification, Promotion, and Operational Authorization through the ratified governance process where applicable.

A candidate may not move from `registered` or `selected_for_staging_poc` to a stronger status solely because its code was added. `implemented_unverified` is not a shortcut around evidence or authorization. Rejected, deferred, excluded, watchlist, and retired candidates remain in history with their rationale so that the same candidate is not repeatedly rediscovered without new evidence.

Any change that would touch datasets, provenance, lineage, Certification, Promotion, training metadata, or durable model metadata must remain within AI-DATABASE and embedded AI Training System governance. Any operational, production, release, public API, customer, or commercial use requires a separate CMI-Systems, LLC decision.
