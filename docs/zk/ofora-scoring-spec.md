# Ofora Scoring Specification

The circuit and frontend use the same integer-safe ranking formula.

Component scores are scaled so `10000` means `100.00`.

```text
lowest_eligible_price = min(price) across eligible suppliers

price_component = (lowest_eligible_price * 10000) / supplier_price
delivery_component = ((maximum_delivery_days - delivery_days + 1) * 10000) / maximum_delivery_days
stock_component = stock_availability * 100
quality_component = quality_rating * 100
local_component = local_contribution * 100

weighted_score =
  price_component * price_weight +
  delivery_component * delivery_weight +
  stock_component * stock_weight +
  quality_component * quality_weight +
  local_component * local_weight
```

The private weighted score is used only for comparison inside the circuit. It is not public.

For the demo tender:

- Atlas is eligible but scores below Nova.
- Nova is eligible and highest scoring.
- Meridian is ineligible because delivery is 18 days and the maximum is 14 days.

