pragma circom 2.2.1;

template Num2Bits(n) {
    signal input in;
    signal output out[n];

    var lc = 0;
    var e2 = 1;
    for (var i = 0; i < n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] - 1) === 0;
        lc += out[i] * e2;
        e2 *= 2;
    }
    lc === in;
}

template LessThan(n) {
    signal input a;
    signal input b;
    signal output out;

    component bits = Num2Bits(n + 1);
    bits.in <== a + (1 << n) - b;
    out <== 1 - bits.out[n];
}

template LessEq(n) {
    signal input a;
    signal input b;
    signal output out;

    component lt = LessThan(n);
    lt.a <== b;
    lt.b <== a;
    out <== 1 - lt.out;
}

template DivFloor(n) {
    signal input numerator;
    signal input denominator;
    signal input quotient;
    signal input remainder;

    component remLtDen = LessThan(n);
    remLtDen.a <== remainder;
    remLtDen.b <== denominator;

    numerator === quotient * denominator + remainder;
    remLtDen.out === 1;
}

template Hash2() {
    signal input a;
    signal input b;
    signal output out;

    // Feasibility-spike field fold for BLS12-381 Groth16 compatibility.
    // It is not a production commitment replacement for Ofora's Poseidon2 path.
    out <== a * 1315423911 + b * 2654435761 + 97;
}

template Fold10() {
    signal input values[10];
    signal output out;

    component h0 = Hash2();
    component h1 = Hash2();
    component h2 = Hash2();
    component h3 = Hash2();
    component h4 = Hash2();
    component h5 = Hash2();
    component h6 = Hash2();
    component h7 = Hash2();
    component h8 = Hash2();

    h0.a <== values[0];
    h0.b <== values[1];
    h1.a <== h0.out;
    h1.b <== values[2];
    h2.a <== h1.out;
    h2.b <== values[3];
    h3.a <== h2.out;
    h3.b <== values[4];
    h4.a <== h3.out;
    h4.b <== values[5];
    h5.a <== h4.out;
    h5.b <== values[6];
    h6.a <== h5.out;
    h6.b <== values[7];
    h7.a <== h6.out;
    h7.b <== values[8];
    h8.a <== h7.out;
    h8.b <== values[9];

    out <== h8.out;
}

template Fold11() {
    signal input values[11];
    signal output out;

    component first = Fold10();
    component last = Hash2();
    for (var i = 0; i < 10; i++) {
        first.values[i] <== values[i];
    }
    last.a <== first.out;
    last.b <== values[10];
    out <== last.out;
}

template Fold9() {
    signal input values[9];
    signal output out;

    component h0 = Hash2();
    component h1 = Hash2();
    component h2 = Hash2();
    component h3 = Hash2();
    component h4 = Hash2();
    component h5 = Hash2();
    component h6 = Hash2();
    component h7 = Hash2();

    h0.a <== values[0];
    h0.b <== values[1];
    h1.a <== h0.out;
    h1.b <== values[2];
    h2.a <== h1.out;
    h2.b <== values[3];
    h3.a <== h2.out;
    h3.b <== values[4];
    h4.a <== h3.out;
    h4.b <== values[5];
    h5.a <== h4.out;
    h5.b <== values[6];
    h6.a <== h5.out;
    h6.b <== values[7];
    h7.a <== h6.out;
    h7.b <== values[8];

    out <== h7.out;
}

template BidCommitment() {
    signal input tenderRef;
    signal input supplierRef;
    signal input price;
    signal input deliveryDays;
    signal input stockAvailability;
    signal input qualityRating;
    signal input localContribution;
    signal input salt;
    signal output out;

    component fold = Fold9();
    fold.values[0] <== 2001;
    fold.values[1] <== tenderRef;
    fold.values[2] <== supplierRef;
    fold.values[3] <== price;
    fold.values[4] <== deliveryDays;
    fold.values[5] <== stockAvailability;
    fold.values[6] <== qualityRating;
    fold.values[7] <== localContribution;
    fold.values[8] <== salt;
    out <== fold.out;
}

template PolicyCommitment() {
    signal input tenderRef;
    signal input priceWeight;
    signal input deliveryWeight;
    signal input stockWeight;
    signal input qualityWeight;
    signal input localWeight;
    signal input minimumQuality;
    signal input maximumDeliveryDays;
    signal input budgetCeiling;
    signal input policyVersion;
    signal output out;

    component fold = Fold11();
    fold.values[0] <== 1001;
    fold.values[1] <== tenderRef;
    fold.values[2] <== priceWeight;
    fold.values[3] <== deliveryWeight;
    fold.values[4] <== stockWeight;
    fold.values[5] <== qualityWeight;
    fold.values[6] <== localWeight;
    fold.values[7] <== minimumQuality;
    fold.values[8] <== maximumDeliveryDays;
    fold.values[9] <== budgetCeiling;
    fold.values[10] <== policyVersion;
    out <== fold.out;
}

template ContextCommitment() {
    signal input selectedSupplierIndex;
    signal input tenderRef;
    signal input receiptNonce;
    signal input policyVersion;
    signal input policyCommitment;
    signal input bidCommitments[3];
    signal input selectedBidCommitment;
    signal output out;

    component fold = Fold10();
    fold.values[0] <== 3001;
    fold.values[1] <== selectedSupplierIndex;
    fold.values[2] <== tenderRef;
    fold.values[3] <== receiptNonce;
    fold.values[4] <== policyVersion;
    fold.values[5] <== policyCommitment;
    fold.values[6] <== bidCommitments[0];
    fold.values[7] <== bidCommitments[1];
    fold.values[8] <== bidCommitments[2];
    fold.values[9] <== selectedBidCommitment;
    out <== fold.out;
}

template Score() {
    signal input price;
    signal input deliveryDays;
    signal input stockAvailability;
    signal input qualityRating;
    signal input localContribution;
    signal input lowestEligiblePrice;
    signal input maximumDeliveryDays;
    signal input priceWeight;
    signal input deliveryWeight;
    signal input stockWeight;
    signal input qualityWeight;
    signal input localWeight;
    signal input priceQuotient;
    signal input priceRemainder;
    signal input deliveryQuotient;
    signal input deliveryRemainder;
    signal output out;

    component priceDiv = DivFloor(32);
    priceDiv.numerator <== lowestEligiblePrice * 10000;
    priceDiv.denominator <== price;
    priceDiv.quotient <== priceQuotient;
    priceDiv.remainder <== priceRemainder;

    component deliveryDiv = DivFloor(32);
    deliveryDiv.numerator <== (maximumDeliveryDays - deliveryDays + 1) * 10000;
    deliveryDiv.denominator <== maximumDeliveryDays;
    deliveryDiv.quotient <== deliveryQuotient;
    deliveryDiv.remainder <== deliveryRemainder;

    signal priceWeighted;
    signal deliveryWeighted;
    signal stockWeighted;
    signal qualityWeighted;
    signal localWeighted;

    priceWeighted <== priceQuotient * priceWeight;
    deliveryWeighted <== deliveryQuotient * deliveryWeight;
    stockWeighted <== (stockAvailability * 100) * stockWeight;
    qualityWeighted <== (qualityRating * 100) * qualityWeight;
    localWeighted <== (localContribution * 100) * localWeight;

    out <== priceWeighted
        + deliveryWeighted
        + stockWeighted
        + qualityWeighted
        + localWeighted;
}

template OforaAward() {
    signal input verificationContextCommitment;
    signal input selectedSupplierIndex;
    signal input tenderRef;
    signal input receiptNonce;
    signal input policyVersion;
    signal input priceWeight;
    signal input deliveryWeight;
    signal input stockWeight;
    signal input qualityWeight;
    signal input localWeight;
    signal input minimumQuality;
    signal input maximumDeliveryDays;
    signal input budgetCeiling;
    signal input supplierRef[3];
    signal input price[3];
    signal input deliveryDays[3];
    signal input stockAvailability[3];
    signal input qualityRating[3];
    signal input localContribution[3];
    signal input salt[3];
    signal input lowestEligiblePrice;
    signal input priceQuotient[3];
    signal input priceRemainder[3];
    signal input deliveryQuotient[3];
    signal input deliveryRemainder[3];
    signal input selectionFlags[3];

    component policy = PolicyCommitment();
    policy.tenderRef <== tenderRef;
    policy.priceWeight <== priceWeight;
    policy.deliveryWeight <== deliveryWeight;
    policy.stockWeight <== stockWeight;
    policy.qualityWeight <== qualityWeight;
    policy.localWeight <== localWeight;
    policy.minimumQuality <== minimumQuality;
    policy.maximumDeliveryDays <== maximumDeliveryDays;
    policy.budgetCeiling <== budgetCeiling;
    policy.policyVersion <== policyVersion;

    component bid0 = BidCommitment();
    component bid1 = BidCommitment();
    component bid2 = BidCommitment();

    bid0.tenderRef <== tenderRef;
    bid0.supplierRef <== supplierRef[0];
    bid0.price <== price[0];
    bid0.deliveryDays <== deliveryDays[0];
    bid0.stockAvailability <== stockAvailability[0];
    bid0.qualityRating <== qualityRating[0];
    bid0.localContribution <== localContribution[0];
    bid0.salt <== salt[0];

    bid1.tenderRef <== tenderRef;
    bid1.supplierRef <== supplierRef[1];
    bid1.price <== price[1];
    bid1.deliveryDays <== deliveryDays[1];
    bid1.stockAvailability <== stockAvailability[1];
    bid1.qualityRating <== qualityRating[1];
    bid1.localContribution <== localContribution[1];
    bid1.salt <== salt[1];

    bid2.tenderRef <== tenderRef;
    bid2.supplierRef <== supplierRef[2];
    bid2.price <== price[2];
    bid2.deliveryDays <== deliveryDays[2];
    bid2.stockAvailability <== stockAvailability[2];
    bid2.qualityRating <== qualityRating[2];
    bid2.localContribution <== localContribution[2];
    bid2.salt <== salt[2];

    signal bidCommitments[3];
    bidCommitments[0] <== bid0.out;
    bidCommitments[1] <== bid1.out;
    bidCommitments[2] <== bid2.out;

    signal isSelected[3];
    isSelected[0] <== selectionFlags[0];
    isSelected[1] <== selectionFlags[1];
    isSelected[2] <== selectionFlags[2];
    isSelected[0] * (isSelected[0] - 1) === 0;
    isSelected[1] * (isSelected[1] - 1) === 0;
    isSelected[2] * (isSelected[2] - 1) === 0;
    isSelected[0] + isSelected[1] + isSelected[2] === 1;
    selectedSupplierIndex === isSelected[1] + 2 * isSelected[2];

    signal selectedBidCommitment;
    signal selectedCommitmentProduct[3];
    selectedCommitmentProduct[0] <== bidCommitments[0] * isSelected[0];
    selectedCommitmentProduct[1] <== bidCommitments[1] * isSelected[1];
    selectedCommitmentProduct[2] <== bidCommitments[2] * isSelected[2];
    selectedBidCommitment <== selectedCommitmentProduct[0]
        + selectedCommitmentProduct[1]
        + selectedCommitmentProduct[2];

    component context = ContextCommitment();
    context.selectedSupplierIndex <== selectedSupplierIndex;
    context.tenderRef <== tenderRef;
    context.receiptNonce <== receiptNonce;
    context.policyVersion <== policyVersion;
    context.policyCommitment <== policy.out;
    context.bidCommitments[0] <== bidCommitments[0];
    context.bidCommitments[1] <== bidCommitments[1];
    context.bidCommitments[2] <== bidCommitments[2];
    context.selectedBidCommitment <== selectedBidCommitment;
    context.out === verificationContextCommitment;

    component qualityOk0 = LessEq(16);
    component qualityOk1 = LessEq(16);
    component qualityOk2 = LessEq(16);
    qualityOk0.a <== minimumQuality;
    qualityOk0.b <== qualityRating[0];
    qualityOk1.a <== minimumQuality;
    qualityOk1.b <== qualityRating[1];
    qualityOk2.a <== minimumQuality;
    qualityOk2.b <== qualityRating[2];

    component deliveryOk0 = LessEq(16);
    component deliveryOk1 = LessEq(16);
    component deliveryOk2 = LessEq(16);
    deliveryOk0.a <== deliveryDays[0];
    deliveryOk0.b <== maximumDeliveryDays;
    deliveryOk1.a <== deliveryDays[1];
    deliveryOk1.b <== maximumDeliveryDays;
    deliveryOk2.a <== deliveryDays[2];
    deliveryOk2.b <== maximumDeliveryDays;

    component budgetOk0 = LessEq(32);
    component budgetOk1 = LessEq(32);
    component budgetOk2 = LessEq(32);
    budgetOk0.a <== price[0];
    budgetOk0.b <== budgetCeiling;
    budgetOk1.a <== price[1];
    budgetOk1.b <== budgetCeiling;
    budgetOk2.a <== price[2];
    budgetOk2.b <== budgetCeiling;

    signal eligible[3];
    signal qualityDeliveryOk[3];
    qualityDeliveryOk[0] <== qualityOk0.out * deliveryOk0.out;
    qualityDeliveryOk[1] <== qualityOk1.out * deliveryOk1.out;
    qualityDeliveryOk[2] <== qualityOk2.out * deliveryOk2.out;
    eligible[0] <== qualityDeliveryOk[0] * budgetOk0.out;
    eligible[1] <== qualityDeliveryOk[1] * budgetOk1.out;
    eligible[2] <== qualityDeliveryOk[2] * budgetOk2.out;

    signal selectedEligibleProduct[3];
    selectedEligibleProduct[0] <== eligible[0] * isSelected[0];
    selectedEligibleProduct[1] <== eligible[1] * isSelected[1];
    selectedEligibleProduct[2] <== eligible[2] * isSelected[2];
    selectedEligibleProduct[0] + selectedEligibleProduct[1] + selectedEligibleProduct[2] === 1;

    component score0 = Score();
    component score1 = Score();
    component score2 = Score();

    score0.price <== price[0];
    score0.deliveryDays <== deliveryDays[0];
    score0.stockAvailability <== stockAvailability[0];
    score0.qualityRating <== qualityRating[0];
    score0.localContribution <== localContribution[0];
    score0.lowestEligiblePrice <== lowestEligiblePrice;
    score0.maximumDeliveryDays <== maximumDeliveryDays;
    score0.priceWeight <== priceWeight;
    score0.deliveryWeight <== deliveryWeight;
    score0.stockWeight <== stockWeight;
    score0.qualityWeight <== qualityWeight;
    score0.localWeight <== localWeight;
    score0.priceQuotient <== priceQuotient[0];
    score0.priceRemainder <== priceRemainder[0];
    score0.deliveryQuotient <== deliveryQuotient[0];
    score0.deliveryRemainder <== deliveryRemainder[0];

    score1.price <== price[1];
    score1.deliveryDays <== deliveryDays[1];
    score1.stockAvailability <== stockAvailability[1];
    score1.qualityRating <== qualityRating[1];
    score1.localContribution <== localContribution[1];
    score1.lowestEligiblePrice <== lowestEligiblePrice;
    score1.maximumDeliveryDays <== maximumDeliveryDays;
    score1.priceWeight <== priceWeight;
    score1.deliveryWeight <== deliveryWeight;
    score1.stockWeight <== stockWeight;
    score1.qualityWeight <== qualityWeight;
    score1.localWeight <== localWeight;
    score1.priceQuotient <== priceQuotient[1];
    score1.priceRemainder <== priceRemainder[1];
    score1.deliveryQuotient <== deliveryQuotient[1];
    score1.deliveryRemainder <== deliveryRemainder[1];

    score2.price <== price[2];
    score2.deliveryDays <== deliveryDays[2];
    score2.stockAvailability <== stockAvailability[2];
    score2.qualityRating <== qualityRating[2];
    score2.localContribution <== localContribution[2];
    score2.lowestEligiblePrice <== lowestEligiblePrice;
    score2.maximumDeliveryDays <== maximumDeliveryDays;
    score2.priceWeight <== priceWeight;
    score2.deliveryWeight <== deliveryWeight;
    score2.stockWeight <== stockWeight;
    score2.qualityWeight <== qualityWeight;
    score2.localWeight <== localWeight;
    score2.priceQuotient <== priceQuotient[2];
    score2.priceRemainder <== priceRemainder[2];
    score2.deliveryQuotient <== deliveryQuotient[2];
    score2.deliveryRemainder <== deliveryRemainder[2];

    signal selectedScore;
    signal selectedScoreProduct[3];
    selectedScoreProduct[0] <== score0.out * isSelected[0];
    selectedScoreProduct[1] <== score1.out * isSelected[1];
    selectedScoreProduct[2] <== score2.out * isSelected[2];
    selectedScore <== selectedScoreProduct[0] + selectedScoreProduct[1] + selectedScoreProduct[2];

    component scoreOk0 = LessEq(32);
    component scoreOk1 = LessEq(32);
    component scoreOk2 = LessEq(32);
    scoreOk0.a <== score0.out;
    scoreOk0.b <== selectedScore;
    scoreOk1.a <== score1.out;
    scoreOk1.b <== selectedScore;
    scoreOk2.a <== score2.out;
    scoreOk2.b <== selectedScore;

    eligible[0] * (1 - scoreOk0.out) === 0;
    eligible[1] * (1 - scoreOk1.out) === 0;
    eligible[2] * (1 - scoreOk2.out) === 0;
}

component main { public [verificationContextCommitment] } = OforaAward();
