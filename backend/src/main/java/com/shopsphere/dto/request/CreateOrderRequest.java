package com.shopsphere.dto.request;

import com.shopsphere.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public class CreateOrderRequest {

    @NotNull(message = "Shipping address ID is required")
    private Long addressId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String simulatedPaymentReference;

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(Long addressId, PaymentMethod paymentMethod, String simulatedPaymentReference) {
        this.addressId = addressId;
        this.paymentMethod = paymentMethod;
        this.simulatedPaymentReference = simulatedPaymentReference;
    }

    public Long getAddressId() {
        return addressId;
    }

    public void setAddressId(Long addressId) {
        this.addressId = addressId;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getSimulatedPaymentReference() {
        return simulatedPaymentReference;
    }

    public void setSimulatedPaymentReference(String simulatedPaymentReference) {
        this.simulatedPaymentReference = simulatedPaymentReference;
    }
}
