"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { HouseholdMember, PacketFormData } from "@/lib/types/packet.types";
import { formatCurrency, totalMonthlyExpenses, totalMonthlyIncome } from "@/lib/utils/packet-helpers";
import { SectionCard, SubSection, Grid, Reveal } from "../ui";
import {
  Field,
  Text,
  TextArea,
  DateField,
  Select,
  Currency,
  RadioCards,
  CheckboxRow,
} from "../fields";

const emptyHouseholdMember = (): HouseholdMember => ({
  name: "",
  age: "",
  relationship: "",
  grossMonthlyIncome: "",
  paysExpenses: false,
});

const TAX_FILING_OPTIONS = [
  { label: "Single", value: "single" },
  { label: "Head of household", value: "headOfHousehold" },
  { label: "Married, filing separately", value: "marriedSeparately" },
  { label: "Married, filing jointly", value: "marriedJointly" },
];

export function FL150Step() {
  const { control } = useFormContext<PacketFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: "fl150.household" });

  const fl150 = useWatch({ control, name: "fl150" });
  const hasMinorChildren = useWatch({ control, name: "intake.hasMinorChildren" });

  const totalIncome = totalMonthlyIncome(fl150);
  const totalExpenses = totalMonthlyExpenses(fl150);

  return (
    <SectionCard
      title="Income and Expense Declaration"
      formNo="FL-150"
      subtitle="A full picture of income, expenses, and household so the court can set support and other financial orders."
    >
      <SubSection title="1. Employment">
        <Grid cols={2}>
          <Field name="fl150.employer" label="Employer's name">
            <Text name="fl150.employer" placeholder="Acme Co." />
          </Field>
          <Field name="fl150.employerAddress" label="Employer's address">
            <Text name="fl150.employerAddress" placeholder="123 Business Way, Riverside, CA" />
          </Field>
        </Grid>
        <Grid cols={2}>
          <Field name="fl150.employerPhone" label="Employer's phone number">
            <Text name="fl150.employerPhone" type="tel" inputMode="tel" placeholder="(951) 555-1234" />
          </Field>
          <Field name="fl150.occupation" label="Occupation">
            <Text name="fl150.occupation" placeholder="Retail manager" />
          </Field>
        </Grid>
        <Grid cols={2}>
          <Field name="fl150.dateJobStarted" label="Date job started">
            <DateField name="fl150.dateJobStarted" />
          </Field>
          <Field name="fl150.dateJobEnded" label="Date job ended" hint="Leave blank if currently employed.">
            <DateField name="fl150.dateJobEnded" />
          </Field>
        </Grid>
        <Grid cols={2}>
          <Field name="fl150.hoursPerWeek" label="Hours worked per week">
            <Text name="fl150.hoursPerWeek" inputMode="numeric" placeholder="40" />
          </Field>
          <Field name="fl150.grossPay" label="Gross pay (before taxes)">
            <Currency name="fl150.grossPay" />
          </Field>
        </Grid>
        <Field name="fl150.payFrequency" label="Pay period">
          <RadioCards
            name="fl150.payFrequency"
            columns={3}
            options={[
              { label: "Per month", value: "month" },
              { label: "Per week", value: "week" },
              { label: "Per hour", value: "hour" },
            ]}
          />
        </Field>
      </SubSection>

      <SubSection title="2. Age & Education">
        <Grid cols={2}>
          <Field name="fl150.age" label="Age">
            <Text name="fl150.age" inputMode="numeric" placeholder="35" />
          </Field>
        </Grid>
        <CheckboxRow
          name="fl150.completedHighSchool"
          label="I have completed high school or the equivalent"
        />
        <Grid cols={3}>
          <Field name="fl150.highestGrade" label="If no, highest grade completed">
            <Text name="fl150.highestGrade" placeholder="10th grade" />
          </Field>
          <Field name="fl150.yearsCollege" label="Years of college completed">
            <Text name="fl150.yearsCollege" inputMode="numeric" placeholder="2" />
          </Field>
          <Field name="fl150.collegeDegrees" label="College degrees held">
            <Text name="fl150.collegeDegrees" placeholder="A.A., B.A." />
          </Field>
        </Grid>
      </SubSection>

      <SubSection title="3. Tax Information">
        <Grid cols={2}>
          <Field name="fl150.lastTaxYear" label="Last tax year filed">
            <Text name="fl150.lastTaxYear" inputMode="numeric" placeholder="2025" />
          </Field>
          <Field name="fl150.taxFilingStatus" label="Filing status">
            <Select name="fl150.taxFilingStatus" options={TAX_FILING_OPTIONS} />
          </Field>
        </Grid>
        {fl150.taxFilingStatus === "marriedJointly" ? (
          <Reveal>
            <Field name="fl150.taxFilingJointName" label="Name of the person I filed jointly with">
              <Text name="fl150.taxFilingJointName" placeholder="Full legal name" />
            </Field>
          </Reveal>
        ) : null}
      </SubSection>

      <SubSection title="4. Other Party's Income">
        <Grid cols={2}>
          <Field name="fl150.otherPartyIncome" label="Estimate of the other party's gross monthly income">
            <Currency name="fl150.otherPartyIncome" />
          </Field>
        </Grid>
        <Field name="fl150.otherPartyIncomeBasis" label="This estimate is based on">
          <TextArea name="fl150.otherPartyIncomeBasis" placeholder="Past pay stubs, tax returns, prior testimony, etc." />
        </Field>
      </SubSection>

      <SubSection title="5. Income (Average Monthly)">
        <Grid cols={2}>
          <Field name="fl150.incomeSalary" label="Salary or wages">
            <Currency name="fl150.incomeSalary" />
          </Field>
          <Field name="fl150.incomeOvertime" label="Overtime">
            <Currency name="fl150.incomeOvertime" />
          </Field>
          <Field name="fl150.incomeCommissions" label="Commissions or bonuses">
            <Currency name="fl150.incomeCommissions" />
          </Field>
          <Field name="fl150.incomePublicAssistance" label="Public assistance">
            <Currency name="fl150.incomePublicAssistance" />
          </Field>
          <Field name="fl150.incomeSpousalSupport" label="Spousal support received">
            <Currency name="fl150.incomeSpousalSupport" />
          </Field>
          <Field name="fl150.incomePension" label="Pension or retirement">
            <Currency name="fl150.incomePension" />
          </Field>
          <Field name="fl150.incomeSocialSecurity" label="Social security">
            <Currency name="fl150.incomeSocialSecurity" />
          </Field>
          <Field name="fl150.incomeUnemployment" label="Unemployment compensation">
            <Currency name="fl150.incomeUnemployment" />
          </Field>
          <Field name="fl150.incomeOther" label="Other income">
            <Currency name="fl150.incomeOther" />
          </Field>
        </Grid>
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
          <span>Total monthly income</span>
          <span>{formatCurrency(totalIncome)}</span>
        </div>
      </SubSection>

      <SubSection title="10. Deductions">
        <Grid cols={2}>
          <Field name="fl150.deductionUnionDues" label="Required union dues">
            <Currency name="fl150.deductionUnionDues" />
          </Field>
          <Field name="fl150.deductionRetirement" label="Retirement contributions (required)">
            <Currency name="fl150.deductionRetirement" />
          </Field>
          <Field name="fl150.deductionHealthInsurance" label="Health insurance premiums">
            <Currency name="fl150.deductionHealthInsurance" />
          </Field>
          <Field name="fl150.deductionChildSupportOther" label="Child/spousal support paid for other relationships">
            <Currency name="fl150.deductionChildSupportOther" />
          </Field>
        </Grid>
      </SubSection>

      <SubSection title="11. Assets">
        <Grid cols={3}>
          <Field name="fl150.assetCash" label="Cash">
            <Currency name="fl150.assetCash" />
          </Field>
          <Field name="fl150.assetStocks" label="Stocks, bonds, and other assets">
            <Currency name="fl150.assetStocks" />
          </Field>
          <Field name="fl150.assetOtherProperty" label="Other property">
            <Currency name="fl150.assetOtherProperty" />
          </Field>
        </Grid>
      </SubSection>

      <SubSection title="12. People Who Live With Me">
        <div className="space-y-4">
          {fields.map((item, index) => (
            <div
              key={item.id}
              className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Household member {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 transition hover:text-rose-700 dark:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
              <Grid cols={3}>
                <Field name={`fl150.household.${index}.name`} label="Name">
                  <Text name={`fl150.household.${index}.name`} placeholder="Full name" />
                </Field>
                <Field name={`fl150.household.${index}.age`} label="Age">
                  <Text name={`fl150.household.${index}.age`} inputMode="numeric" placeholder="10" />
                </Field>
                <Field name={`fl150.household.${index}.relationship`} label="Relationship to me">
                  <Text name={`fl150.household.${index}.relationship`} placeholder="Child, roommate, parent, etc." />
                </Field>
              </Grid>
              <Grid cols={2}>
                <Field name={`fl150.household.${index}.grossMonthlyIncome`} label="Gross monthly income">
                  <Currency name={`fl150.household.${index}.grossMonthlyIncome`} />
                </Field>
              </Grid>
              <CheckboxRow
                name={`fl150.household.${index}.paysExpenses`}
                label="Pays some household expenses"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => append(emptyHouseholdMember(), { shouldFocus: false })}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-400 hover:bg-sky-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-500"
          >
            <Plus className="h-4 w-4" />
            Add a household member
          </button>
        </div>
      </SubSection>

      <SubSection title="13. Estimated Monthly Expenses">
        <Grid cols={2}>
          <Field name="fl150.expenseHome" label="Home (rent or mortgage & maintenance)">
            <Currency name="fl150.expenseHome" />
          </Field>
          <Field name="fl150.expenseHealthCare" label="Health-care costs not covered by insurance">
            <Currency name="fl150.expenseHealthCare" />
          </Field>
          <Field name="fl150.expenseChildCare" label="Child care">
            <Currency name="fl150.expenseChildCare" />
          </Field>
          <Field name="fl150.expenseGroceries" label="Groceries and household supplies">
            <Currency name="fl150.expenseGroceries" />
          </Field>
          <Field name="fl150.expenseEatingOut" label="Eating out">
            <Currency name="fl150.expenseEatingOut" />
          </Field>
          <Field name="fl150.expenseUtilities" label="Utilities (gas, electric, water, trash)">
            <Currency name="fl150.expenseUtilities" />
          </Field>
          <Field name="fl150.expensePhone" label="Telephone, cell phone, internet">
            <Currency name="fl150.expensePhone" />
          </Field>
          <Field name="fl150.expenseLaundry" label="Laundry and cleaning">
            <Currency name="fl150.expenseLaundry" />
          </Field>
          <Field name="fl150.expenseClothes" label="Clothes">
            <Currency name="fl150.expenseClothes" />
          </Field>
          <Field name="fl150.expenseEducation" label="Education">
            <Currency name="fl150.expenseEducation" />
          </Field>
          <Field name="fl150.expenseEntertainment" label="Entertainment and gifts">
            <Currency name="fl150.expenseEntertainment" />
          </Field>
          <Field name="fl150.expenseAuto" label="Auto (gas, maintenance, transportation)">
            <Currency name="fl150.expenseAuto" />
          </Field>
          <Field name="fl150.expenseInsurance" label="Insurance (life, accident)">
            <Currency name="fl150.expenseInsurance" />
          </Field>
          <Field name="fl150.expenseSavings" label="Savings and investments">
            <Currency name="fl150.expenseSavings" />
          </Field>
          <Field name="fl150.expenseOther" label="Other">
            <Currency name="fl150.expenseOther" />
          </Field>
        </Grid>
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
          <span>Total monthly expenses</span>
          <span>{formatCurrency(totalExpenses)}</span>
        </div>
      </SubSection>

      {hasMinorChildren ? (
        <SubSection title="Child Support Information">
          <Grid cols={2}>
            <Field name="fl150.numberChildrenUnder18" label="Number of children under 18">
              <Text name="fl150.numberChildrenUnder18" inputMode="numeric" placeholder="2" />
            </Field>
          </Grid>
          <Grid cols={2}>
            <Field name="fl150.timeWithMePercent" label="% time with me">
              <Text name="fl150.timeWithMePercent" inputMode="numeric" placeholder="50" />
            </Field>
            <Field name="fl150.timeWithOtherPercent" label="% time with other parent">
              <Text name="fl150.timeWithOtherPercent" inputMode="numeric" placeholder="50" />
            </Field>
          </Grid>
          <CheckboxRow
            name="fl150.hasChildHealthInsurance"
            label="I have health insurance available for the children through my job"
          />
          <Grid cols={2}>
            <Field name="fl150.childInsuranceCompany" label="Insurance company">
              <Text name="fl150.childInsuranceCompany" placeholder="Insurance provider name" />
            </Field>
            <Field name="fl150.childInsuranceMonthlyCost" label="Monthly cost to add the children">
              <Currency name="fl150.childInsuranceMonthlyCost" />
            </Field>
          </Grid>
        </SubSection>
      ) : null}

      <SubSection>
        <Field name="fl150.date" label="Date" required>
          <DateField name="fl150.date" />
        </Field>
      </SubSection>
    </SectionCard>
  );
}
