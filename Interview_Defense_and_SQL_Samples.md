# Technical Interview Defense & Code Samples

This document provides the exact code implementations, data models, and explanation scripts for the projects listed on **Rushikesh Patil's** resume. If an interviewer asks you to write code on a whiteboard or explain your logic, use these references.

---

## 1. Project 1: Retail Sales & Customer Performance Dashboard (SQL & Power BI)

### Relational Schema (4 Tables)
- **`customers`** (`customer_id`, `customer_name`, `city`, `state`, `signup_date`)
- **`orders`** (`order_id`, `customer_id`, `order_date`, `order_status`, `shipping_city`)
- **`order_items`** (`order_item_id`, `order_id`, `product_id`, `quantity`, `unit_price`, `discount`)
- **`products`** (`product_id`, `product_name`, `category`, `cost_price`)

### Defensible SQL Query 1: Customer Lifetime Value & Recency Analysis (CTEs + Window Functions)
```sql
WITH customer_orders AS (
    SELECT 
        c.customer_id,
        c.customer_name,
        c.state,
        o.order_id,
        o.order_date,
        SUM(oi.quantity * oi.unit_price * (1 - oi.discount)) AS order_value,
        ROW_NUMBER() OVER (
            PARTITION BY c.customer_id 
            ORDER BY o.order_date DESC
        ) AS recency_rank
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    INNER JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status = 'Completed'
    GROUP BY c.customer_id, c.customer_name, c.state, o.order_id, o.order_date
),
customer_summary AS (
    SELECT 
        customer_id,
        customer_name,
        state,
        COUNT(order_id) AS total_orders,
        ROUND(SUM(order_value)::numeric, 2) AS lifetime_spend,
        ROUND(AVG(order_value)::numeric, 2) AS average_order_value,
        MAX(CASE WHEN recency_rank = 1 THEN order_date END) AS last_order_date
    FROM customer_orders
    GROUP BY customer_id, customer_name, state
)
SELECT 
    customer_id,
    customer_name,
    state,
    total_orders,
    lifetime_spend,
    average_order_value,
    last_order_date,
    DENSE_RANK() OVER (ORDER BY lifetime_spend DESC) AS spend_rank
FROM customer_summary
ORDER BY lifetime_spend DESC
LIMIT 20;
```

### Power BI Data Model (Star Schema)
- **Fact Table:** `Fact_Sales` (Grain: one row per order line item)
- **Dimension Tables:** `Dim_Customer`, `Dim_Product`, `Dim_Date`, `Dim_Region`
- **Relationship:** 1-to-many (`1:*`) from Dimensions to `Fact_Sales` with single-direction cross-filtering.

### Core DAX Measures Used in the Dashboard
```dax
-- Total Revenue
Total Revenue = 
SUMX(Fact_Sales, Fact_Sales[Quantity] * Fact_Sales[UnitPrice] * (1 - Fact_Sales[Discount]))

-- Average Order Value (AOV)
Average Order Value = 
DIVIDE([Total Revenue], DISTINCTCOUNT(Fact_Sales[OrderID]), 0)

-- Return Rate %
Return Rate = 
DIVIDE(
    CALCULATE(COUNTROWS(Fact_Sales), Fact_Sales[OrderStatus] = "Returned"),
    COUNTROWS(Fact_Sales),
    0
)

-- Month-over-Month (MoM) Revenue Growth %
Revenue Prior Month = 
CALCULATE([Total Revenue], DATEADD(Dim_Date[Date], -1, MONTH))

MoM Revenue Growth % = 
DIVIDE([Total Revenue] - [Revenue Prior Month], [Revenue Prior Month], 0)
```

---

## 2. Project 2: Customer Churn Exploratory Analysis (Python)

### Key Python / Pandas Data Cleaning Workflow
```python
import pandas as pd
import numpy as np

# Load dataset
df = pd.read_csv("telecom_churn.csv")

# 1. Clean column names
df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')

# 2. Fix data type inconsistencies
# 'total_charges' has blank spaces for new customers (tenure == 0)
df['total_charges'] = pd.to_numeric(df['total_charges'].str.strip(), errors='coerce')
df['total_charges'] = df['total_charges'].fillna(0)

# 3. Standardize categorical labels
df['senior_citizen'] = df['senior_citizen'].map({1: 'Yes', 0: 'No'})

# 4. Check churn rate distribution
churn_distribution = df['churn'].value_counts(normalize=True) * 100
print(f"Overall Churn Rate: {churn_distribution['Yes']:.2f}%")

# 5. Segment churn by contract type
contract_churn = df.groupby('contract')['churn'].value_counts(normalize=True).unstack() * 100
print(contract_churn)
# Insight: Month-to-month contracts had ~42% churn vs. < 3% for two-year contracts.
```

### Interview Explanation:
> *"The raw dataset contained blank strings in numeric columns where tenure was zero. Blindly dropping these rows would introduce bias against newly onboarded customers. I converted errors to nulls, imputed them as zero charges, and discovered that month-to-month subscribers churned at 14x the rate of annual subscribers."*

---

## 3. Project 3: Automated Inventory Tracker (Advanced Excel)

### Key Formulas Used:
1. **Dynamic Stock Status Lookup:**
   ```excel
   =XLOOKUP(A2, Products!A:A, Products!C:C, "Not Found", 0)
   ```
2. **Reorder Alert Condition:**
   ```excel
   =IF(Current_Stock <= Safety_Stock, "REORDER REQUIRED", "STABLE")
   ```
3. **Multi-Condition Aggregation (SUMIFS):**
   ```excel
   =SUMIFS(Inventory[Quantity], Inventory[Category], "Electronics", Inventory[Status], "In Stock")
   ```

---

## 4. Top 5 Questions Interviewers Will Ask You & Ideal Responses

### Q1: "What is the difference between `WHERE` and `HAVING` in SQL?"
> *"The `WHERE` clause filters individual records before any grouping or aggregation takes place. The `HAVING` clause filters aggregated groups after the `GROUP BY` clause is evaluated. For example, `WHERE order_status = 'Completed'` filters rows first, whereas `HAVING SUM(order_value) > 10000` filters only customer groups whose total spend exceeds 10,000."*

### Q2: "Why do you use `XLOOKUP` over `VLOOKUP`?"
> *"First, `XLOOKUP` can search to the left or right, whereas `VLOOKUP` requires the lookup value to be in the first column. Second, `XLOOKUP` defaults to exact match without needing `FALSE`. Third, inserting or deleting columns in the source sheet will not break an `XLOOKUP` formula because it uses explicit cell/range references instead of static column index numbers."*

### Q3: "What is the difference between `RANK()`, `DENSE_RANK()`, and `ROW_NUMBER()`?"
> *"If two rows have identical values (e.g., spend of ₹5,000):*
> - *`ROW_NUMBER()` assigns consecutive unique integers (1, 2, 3), breaking ties arbitrarily.*
> - *`RANK()` assigns the same rank to ties and skips subsequent numbers (1, 2, 2, 4).*
> - *`DENSE_RANK()` assigns the same rank to ties without skipping numbers (1, 2, 2, 3).*
> *In my sales project, I used `DENSE_RANK()` so that top-spending tiers did not leave rank gaps."*

### Q4: "How do you handle missing values in a dataset?"
> *"I never delete rows automatically. First, I examine whether missingness is random or systematic. For example, in the telecom dataset, missing total charges occurred exclusively when customer tenure was 0 months, so filling with 0 made mathematical sense. For continuous variables with normal distribution, median imputation is preferred over mean to avoid outlier skew."*

### Q5: "What is the purpose of Star Schema in Power BI?"
> *"A Star Schema separates quantitative measurements (`Fact tables`) from descriptive attributes (`Dimension tables`). This eliminates data redundancy, simplifies DAX logic, and speeds up query response times compared to working with a single wide, unnormalized flat table."*
