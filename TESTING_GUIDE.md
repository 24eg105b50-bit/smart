# ShopSphere Campus - Automated Testing Guide

This guide details the automated test suite designed for the ShopSphere Campus backend, built using **JUnit 5**, **Mockito**, and **AssertJ**.

---

## 1. Test Architecture & Execution

The testing suite validates critical domain logic, security constraints, and e-commerce transactions:
- **Unit Isolation**: Service components are tested using Mockito mocks (`@ExtendWith(MockitoExtension.class)`), isolating database dependencies.
- **Java 21/25 Compatibility**: Configured with `mock-maker-subclass` to support strict class loading constraints in modern OpenJDK runtimes.

### Command to Execute Test Suite
From the `backend` directory:
```powershell
mvnw.cmd test
```

---

## 2. Test Classes & Coverage Matrix

| Test Suite | File Location | Test Method | Test Objective / Edge Case |
| :--- | :--- | :--- | :--- |
| **AuthServiceTest** | `service/AuthServiceTest.java` | `testRegister_Success` | Validates student registration, password hashing via BCrypt, and initial role assignment |
| | | `testRegister_DuplicateEmail_ThrowsException` | Ensures duplicate emails trigger `BadRequestException` |
| | | `testLogin_Success` | Tests credential authentication and signed JWT issuance |
| **CartServiceTest** | `service/CartServiceTest.java` | `testAddToCart_Success` | Tests adding active products within available stock limits |
| | | `testAddToCart_ExceedsStock_ThrowsException` | Asserts error thrown if requested quantity exceeds available inventory |
| | | `testUpdateQuantity_Success` | Validates updating quantity and line totals |
| **OrderServiceTest** | `service/OrderServiceTest.java` | `testCreateOrder_Success` | Asserts atomic order placement, address linking, coupon discount, and inventory deduction |
| | | `testCreateOrder_InsufficientStock_ThrowsException` | Confirms transaction rollback when stock is insufficient |
| | | `testCancelOrder_Success` | Validates order cancellation and stock restoration |
| **ProductServiceTest** | `service/ProductServiceTest.java` | `testGetAllProducts_Success` | Validates catalog pagination and active filtering |
| | | `testGetProductBySlug_Success` | Tests slug-based product detail resolution |
| | | `testUpdateStock_Success` | Asserts inventory stock adjustment |
| | | `testDeleteProduct_SoftDelete` | Asserts soft-delete sets `active = false` without data loss |
| **ReviewServiceTest** | `service/ReviewServiceTest.java` | `testSubmitReview_Success` | Tests review submission with verified purchase detection |
| | | `testSubmitReview_InvalidRating_ThrowsException` | Asserts rating outside 1-5 range is rejected |
| | | `testSubmitReview_RecalculatesAverageRating` | Tests dynamic recalculation of product average rating and review counts |
| **AiAssistantServiceTest**| `service/AiAssistantServiceTest.java` | `testSendMessage_WithCatalogGrounding` | Verifies dynamic retrieval of matching products injected into prompt |
| | | `testSendMessage_WithPolicyRAG` | Asserts retrieval of hostel delivery and textbook return policies |
| | | `testSendMessage_PreservesChatSession` | Validates session persistence across conversational turns |

---

## 3. Automated Test Execution Verification

```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.shopsphere.service.AiAssistantServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.887 s -- in com.shopsphere.service.AiAssistantServiceTest
[INFO] Running com.shopsphere.service.AuthServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.126 s -- in com.shopsphere.service.AuthServiceTest
[INFO] Running com.shopsphere.service.CartServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.089 s -- in com.shopsphere.service.CartServiceTest
[INFO] Running com.shopsphere.service.OrderServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.098 s -- in com.shopsphere.service.OrderServiceTest
[INFO] Running com.shopsphere.service.ProductServiceTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.092 s -- in com.shopsphere.service.ProductServiceTest
[INFO] Running com.shopsphere.service.ReviewServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.081 s -- in com.shopsphere.service.ReviewServiceTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 19, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```
