<template>
  <div class="rice-survey">
    <!-- Notification stack -->
    <div v-if="notifications.length" class="rice-survey__notifications">
      <PolarisBanner
        v-for="n in notifications"
        :key="n.id"
        :variant="n.type === 'error' ? 'critical' : n.type === 'warning' ? 'warning' : n.type === 'success' ? 'success' : 'info'"
        dismissible
        @dismiss="dismissNotification(n.id)"
      >
        {{ n.message }}
      </PolarisBanner>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- PHASE 1: Tel Lookup                        -->
    <!-- ═══════════════════════════════════════════ -->
    <div v-if="phase === 'tel_lookup'" class="rice-survey__phase">
      <PolarisCard>
        <PolarisCardHeader
          title="แบบสอบถามเกษตรกร — ข้าว"
          description="กรุณากรอกหมายเลขโทรศัพท์ของเกษตรกร"
        />
        <PolarisCardSection>
          <PolarisBlockStack gap="400">
            <PolarisTextField
              label="หมายเลขโทรศัพท์"
              type="tel"
              placeholder="08X-XXX-XXXX"
              :modelValue="telInput"
              @update:modelValue="telInput = $event"
              :error="telError"
            />

            <PolarisButton
              variant="primary"
              :loading="isLookingUp"
              :disabled="!telInput?.trim()"
              @click="lookupFarmer"
            >
              ค้นหา
            </PolarisButton>

            <PolarisBanner
              v-if="farmerUser && !isLookingUp"
              variant="success"
            >
              พบข้อมูล: {{ farmerUser.firstname }} {{ farmerUser.lastname }}
              <template #actions>
                <PolarisButton size="slim" @click="goToProfileReview">ตรวจสอบข้อมูล</PolarisButton>
              </template>
            </PolarisBanner>

            <PolarisBanner
              v-if="showNotFoundBanner"
              variant="info"
            >
              ไม่พบข้อมูลในระบบ กรุณากรอกข้อมูลลงทะเบียน
              <template #actions>
                <PolarisButton size="slim" @click="goToSignup">ลงทะเบียน</PolarisButton>
              </template>
            </PolarisBanner>
          </PolarisBlockStack>
        </PolarisCardSection>
      </PolarisCard>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- PHASE 2: Signup                            -->
    <!-- ═══════════════════════════════════════════ -->
    <div v-else-if="phase === 'signup'" class="rice-survey__phase">
      <PolarisCard>
        <PolarisCardHeader
          title="ลงทะเบียนเกษตรกร"
          description="กรอกข้อมูลเพื่อสร้างบัญชีใหม่"
        />
        <PolarisCardSection>
          <PolarisBlockStack gap="400">
            <div class="rice-survey__form-row">
              <PolarisTextField
                label="ชื่อ"
                required
                :modelValue="signupData.firstname"
                @update:modelValue="signupData.firstname = $event"
                :error="signupErrors.firstname"
              />
              <PolarisTextField
                label="นามสกุล"
                required
                :modelValue="signupData.lastname"
                @update:modelValue="signupData.lastname = $event"
                :error="signupErrors.lastname"
              />
            </div>

            <div class="rice-survey__form-row rice-survey__form-row--3col">
              <PolarisSelect
                label="จังหวัด *"
                :options="provinces"
                :modelValue="signupData.province_id"
                @update:modelValue="onProvinceChange($event)"
                :error="signupErrors.city"
                placeholder="เลือกจังหวัด"
              />
              <PolarisSelect
                label="อำเภอ *"
                :options="districts"
                :modelValue="signupData.district_id"
                @update:modelValue="onDistrictChange($event)"
                :error="signupErrors.district"
                placeholder="เลือกอำเภอ"
                :disabled="!signupData.province_id"
              />
              <PolarisSelect
                label="ตำบล *"
                :options="subdistricts"
                :modelValue="signupData.subdistrict_id"
                @update:modelValue="onSubdistrictChange($event)"
                :error="signupErrors.subdistrict"
                placeholder="เลือกตำบล"
                :disabled="!signupData.district_id"
              />
            </div>

            <div class="rice-survey__crop-section">
              <PolarisText variant="bodyMd" fontWeight="semibold">พืชที่ปลูก *</PolarisText>
              <div class="rice-survey__crop-checks">
                <PolarisCheckbox
                  v-for="crop in cropOptions"
                  :key="crop.value"
                  :label="crop.label"
                  :modelValue="signupData.crop.includes(crop.value)"
                  @update:modelValue="toggleCrop(crop.value, $event)"
                />
              </div>
              <PolarisText v-if="signupErrors.crop" variant="bodySm" color="critical">{{ signupErrors.crop }}</PolarisText>
            </div>

            <PolarisTextField
              label="พื้นที่เพาะปลูก (ไร่)"
              required
              type="number"
              suffix="ไร่"
              :modelValue="signupData.area"
              @update:modelValue="signupData.area = $event ? Number($event) : null"
              :error="signupErrors.area"
            />

            <PolarisInline gap="200">
              <PolarisButton :disabled="isCreatingUser" @click="phase = 'tel_lookup'">ย้อนกลับ</PolarisButton>
              <PolarisButton variant="primary" :loading="isCreatingUser" @click="validateAndCreateUser">
                ลงทะเบียนและเริ่มสำรวจ
              </PolarisButton>
            </PolarisInline>
          </PolarisBlockStack>
        </PolarisCardSection>
      </PolarisCard>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- PHASE 2.5: Profile Review/Edit             -->
    <!-- ═══════════════════════════════════════════ -->
    <div v-else-if="phase === 'profile_review'" class="rice-survey__phase">
      <PolarisCard>
        <PolarisCardHeader
          title="ตรวจสอบข้อมูลเกษตรกร"
          description="กรุณาตรวจสอบและแก้ไขข้อมูลหากไม่ถูกต้อง"
        />
        <PolarisCardSection>
          <PolarisBlockStack gap="400">
            <div class="rice-survey__form-row">
              <PolarisTextField
                label="ชื่อ"
                required
                :modelValue="profileData.firstname"
                @update:modelValue="profileData.firstname = $event"
                :error="profileErrors.firstname"
              />
              <PolarisTextField
                label="นามสกุล"
                required
                :modelValue="profileData.lastname"
                @update:modelValue="profileData.lastname = $event"
                :error="profileErrors.lastname"
              />
            </div>

            <div class="rice-survey__form-row rice-survey__form-row--3col">
              <PolarisSelect
                label="จังหวัด *"
                :options="provinces"
                :modelValue="profileData.province_id"
                @update:modelValue="onProfileProvinceChange($event)"
                :error="profileErrors.city"
                placeholder="เลือกจังหวัด"
              />
              <PolarisSelect
                label="อำเภอ *"
                :options="profileDistricts"
                :modelValue="profileData.district_id"
                @update:modelValue="onProfileDistrictChange($event)"
                :error="profileErrors.district"
                placeholder="เลือกอำเภอ"
                :disabled="!profileData.province_id"
              />
              <PolarisSelect
                label="ตำบล *"
                :options="profileSubdistricts"
                :modelValue="profileData.subdistrict_id"
                @update:modelValue="onProfileSubdistrictChange($event)"
                :error="profileErrors.subdistrict"
                placeholder="เลือกตำบล"
                :disabled="!profileData.district_id"
              />
            </div>

            <div class="rice-survey__crop-section">
              <PolarisText variant="bodyMd" fontWeight="semibold">พืชที่ปลูก *</PolarisText>
              <div class="rice-survey__crop-checks">
                <PolarisCheckbox
                  v-for="crop in cropOptions"
                  :key="crop.value"
                  :label="crop.label"
                  :modelValue="profileData.crop.includes(crop.value)"
                  @update:modelValue="toggleProfileCrop(crop.value, $event)"
                />
              </div>
              <PolarisText v-if="profileErrors.crop" variant="bodySm" color="critical">{{ profileErrors.crop }}</PolarisText>
            </div>

            <PolarisTextField
              label="พื้นที่เพาะปลูก (ไร่)"
              required
              type="number"
              suffix="ไร่"
              :modelValue="profileData.area"
              @update:modelValue="profileData.area = $event ? Number($event) : null"
              :error="profileErrors.area"
            />

            <PolarisInline gap="200">
              <PolarisButton @click="phase = 'tel_lookup'">ย้อนกลับ</PolarisButton>
              <PolarisButton variant="primary" :loading="isUpdatingProfile" @click="validateAndUpdateProfile">
                บันทึกและเริ่มสำรวจ
              </PolarisButton>
              <PolarisButton variant="plain" @click="startSurvey">เริ่มสำรวจ (ไม่แก้ไข)</PolarisButton>
            </PolarisInline>
          </PolarisBlockStack>
        </PolarisCardSection>
      </PolarisCard>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- PHASE 3: Survey Wizard                     -->
    <!-- ═══════════════════════════════════════════ -->
    <div v-else-if="phase === 'survey'" class="rice-survey__phase">
      <!-- Progress indicator -->
      <div class="rice-survey__progress">
        <div class="rice-survey__progress-bar">
          <div class="rice-survey__progress-fill" :style="{ width: progressPct + '%' }"></div>
        </div>
        <PolarisText variant="bodySm" color="subdued">
          ขั้นตอน {{ currentStep }} / {{ totalSteps }}
        </PolarisText>
      </div>

      <!-- Step title -->
      <PolarisText variant="headingLg">{{ currentStepTitle }}</PolarisText>

      <!-- ─── Step 1: Section A ─── -->
      <div v-if="currentStep === 1" class="rice-survey__step">
        <PolarisCard>
          <PolarisCardSection>
            <PolarisBlockStack gap="400">
              <PolarisTextField
                label="A1. ปัจจุบันนี้คุณอายุเท่าไร (ปี)"
                type="number" required
                :min="15" :max="99" suffix="ปี"
                :modelValue="surveyData.a1_age"
                @update:modelValue="surveyData.a1_age = $event ? Number($event) : null"
                :error="stepErrors.a1_age"
              />
              <PolarisTextField
                label="A2. ในฤดูกาลล่าสุด คุณปลูกข้าวรวมทั้งสิ้นกี่ไร่"
                type="number" required :min="1" suffix="ไร่"
                :modelValue="surveyData.a2_rice_area_rai"
                @update:modelValue="surveyData.a2_rice_area_rai = $event ? Number($event) : null"
                :error="stepErrors.a2_rice_area_rai"
              />
              <PolarisSelect
                label="A3. ในฤดูกาลล่าสุด คุณเก็บเกี่ยวเสร็จสิ้นในเดือนไหน"
                :options="monthOptions" required
                :modelValue="surveyData.a3_harvest_month"
                @update:modelValue="surveyData.a3_harvest_month = $event"
                :error="stepErrors.a3_harvest_month"
                placeholder="เลือกเดือน"
              />
              <PolarisTextField
                label="A4. คุณปลูกข้าวมาเป็นระยะเวลากี่ปีแล้ว"
                type="number" required :min="1" suffix="ปี"
                :modelValue="surveyData.a4_farming_years"
                @update:modelValue="surveyData.a4_farming_years = $event ? Number($event) : null"
                :error="stepErrors.a4_farming_years"
              />
              <PolarisTextField
                label="A5. โดยเฉลี่ย ใน 1 ปี คุณปลูกข้าวทั้งหมดกี่ฤดู"
                type="number" required :min="1" :max="4" suffix="ฤดู"
                :modelValue="surveyData.a5_seasons_per_year"
                @update:modelValue="surveyData.a5_seasons_per_year = $event ? Number($event) : null"
                :error="stepErrors.a5_seasons_per_year"
              />

              <VarietyRepeater
                :modelValue="surveyData.a6_rice_varieties"
                @update:modelValue="surveyData.a6_rice_varieties = $event"
              />
              <PolarisText v-if="stepErrors.a6_rice_varieties" variant="bodySm" color="critical">{{ stepErrors.a6_rice_varieties }}</PolarisText>

              <PolarisTextField
                label="A7. ผลผลิตต่อไร่จากการเก็บเกี่ยวครั้งล่าสุด"
                type="number" required :min="0" suffix="กก./ไร่"
                :modelValue="surveyData.a7_yield_per_rai"
                @update:modelValue="surveyData.a7_yield_per_rai = $event ? Number($event) : null"
                :error="stepErrors.a7_yield_per_rai"
              />
              <PolarisTextField
                label="A8. ราคาขายข้าวจากการเก็บเกี่ยวครั้งล่าสุด"
                type="number" required :min="0" suffix="บาท/ตัน/เกวียน"
                :modelValue="surveyData.a8_selling_price"
                @update:modelValue="surveyData.a8_selling_price = $event ? Number($event) : null"
                :error="stepErrors.a8_selling_price"
              />
              <PolarisTextField
                label="A9. ราคาข้าวขั้นต่ำที่จะไม่ขาดทุน"
                type="number" required :min="0" suffix="บาท/ตัน/เกวียน"
                :modelValue="surveyData.a9_breakeven_price"
                @update:modelValue="surveyData.a9_breakeven_price = $event ? Number($event) : null"
                :error="stepErrors.a9_breakeven_price"
              />
            </PolarisBlockStack>
          </PolarisCardSection>
        </PolarisCard>
      </div>

      <!-- ─── Step 2: Section B (Weeds) ─── -->
      <div v-else-if="currentStep === 2" class="rice-survey__step">
        <PolarisCard>
          <PolarisCardSection>
            <AssessmentMatrix
              title="B1. คุณพบเจอวัชพืชอะไรบ้างในนาข้าวในฤดูกาลล่าสุด"
              :items="weedOptions"
              :modelValue="surveyData.b_weed_assessment"
              @update:modelValue="surveyData.b_weed_assessment = $event"
              damageLabel="B2. ระดับความเสียหาย"
              controlLabel="B3. ความยากง่ายในการควบคุม"
            />
          </PolarisCardSection>
        </PolarisCard>
      </div>

      <!-- ─── Step 3: Section C (Insects) ─── -->
      <div v-else-if="currentStep === 3" class="rice-survey__step">
        <PolarisCard>
          <PolarisCardSection>
            <AssessmentMatrix
              title="C1. คุณพบเจอแมลง/หนอนอะไรบ้างในนาข้าวในฤดูกาลล่าสุด"
              :items="insectOptions"
              :modelValue="surveyData.c_insect_assessment"
              @update:modelValue="surveyData.c_insect_assessment = $event"
              :showStages="true"
              damageLabel="C3. ระดับความเสียหาย"
              controlLabel="C4. ความยากง่ายในการควบคุม"
            />
          </PolarisCardSection>
        </PolarisCard>
      </div>

      <!-- ─── Step 4: Section D (Diseases) ─── -->
      <div v-else-if="currentStep === 4" class="rice-survey__step">
        <PolarisCard>
          <PolarisCardSection>
            <AssessmentMatrix
              title="D1. คุณพบเจอโรคอะไรบ้างในนาข้าวในฤดูกาลล่าสุด"
              :items="diseaseOptions"
              :modelValue="surveyData.d_disease_assessment"
              @update:modelValue="surveyData.d_disease_assessment = $event"
              :showStages="true"
              damageLabel="D3. ระดับความเสียหาย"
              controlLabel="D4. ความยากง่ายในการควบคุม"
            />
          </PolarisCardSection>
        </PolarisCard>
      </div>

      <!-- ─── Step 5: Section E (Pesticide) ─── -->
      <div v-else-if="currentStep === 5" class="rice-survey__step">
        <PolarisBlockStack gap="400">
          <SprayStagePanel
            v-for="stage in growthStages"
            :key="stage.key"
            :stageKey="stage.key"
            :stageLabel="stage.label"
            :modelValue="surveyData.e1_e5_spray_applications?.stages?.[stage.key]"
            @update:modelValue="updateSprayStage(stage.key, $event)"
          />

          <PolarisCard>
            <PolarisCardHeader
              title="E6. ค่าใช้จ่ายสารอารักขาพืช"
              description="กรุณาระบุค่าใช้จ่ายรวมและสัดส่วนของสารแต่ละประเภท"
            />
            <PolarisCardSection>
              <PolarisBlockStack gap="400">
                <PolarisTextField
                  label="ค่าใช้จ่ายรวม (บาท/ไร่/ฤดู)"
                  type="number" :min="0" suffix="บาท"
                  :modelValue="surveyData.e6_total_cost"
                  @update:modelValue="surveyData.e6_total_cost = $event ? Number($event) : null"
                />
                <div class="rice-survey__form-row">
                  <PolarisTextField
                    label="E6.1 ยาหญ้า (%)"
                    type="number" :min="0" :max="100" suffix="%"
                    :modelValue="surveyData.e6_1_herbicide_pct"
                    @update:modelValue="surveyData.e6_1_herbicide_pct = $event ? Number($event) : null"
                  />
                  <PolarisTextField
                    label="E6.2 ยาแมลง (%)"
                    type="number" :min="0" :max="100" suffix="%"
                    :modelValue="surveyData.e6_2_insecticide_pct"
                    @update:modelValue="surveyData.e6_2_insecticide_pct = $event ? Number($event) : null"
                  />
                </div>
                <div class="rice-survey__form-row">
                  <PolarisTextField
                    label="E6.3 ยาโรค (%)"
                    type="number" :min="0" :max="100" suffix="%"
                    :modelValue="surveyData.e6_3_fungicide_pct"
                    @update:modelValue="surveyData.e6_3_fungicide_pct = $event ? Number($event) : null"
                  />
                  <PolarisTextField
                    label="E6.4 ฮอร์โมนส์ (%)"
                    type="number" :min="0" :max="100" suffix="%"
                    :modelValue="surveyData.e6_4_hormone_pct"
                    @update:modelValue="surveyData.e6_4_hormone_pct = $event ? Number($event) : null"
                  />
                </div>
                <PolarisBanner
                  v-if="costPctSum > 0 && costPctSum !== 100"
                  variant="warning"
                >
                  สัดส่วนรวม {{ costPctSum }}% (ควรรวมได้ 100%)
                </PolarisBanner>
              </PolarisBlockStack>
            </PolarisCardSection>
          </PolarisCard>

          <PolarisCard>
            <PolarisCardSection>
              <PolarisSelect
                label="E7. ในฤดูกาลหน้า การลงทุนในการใช้ยาจะเป็นอย่างไร"
                :options="investmentOptions"
                :modelValue="surveyData.e7_investment_plan"
                @update:modelValue="surveyData.e7_investment_plan = $event"
                :error="stepErrors.e7_investment_plan"
                required
                placeholder="เลือกแผนการลงทุน"
              />
            </PolarisCardSection>
          </PolarisCard>
        </PolarisBlockStack>
      </div>

      <!-- ─── Step 6: Review & Submit ─── -->
      <div v-else-if="currentStep === 6" class="rice-survey__step">
        <PolarisBlockStack gap="400">
          <!-- Farmer info -->
          <PolarisCard>
            <PolarisCardHeader title="ข้อมูลผู้สัมภาษณ์">
              <template v-if="isNewUser" #action>
                <PolarisBadge variant="info">ผู้ใช้ใหม่</PolarisBadge>
              </template>
            </PolarisCardHeader>
            <PolarisCardSection>
              <PolarisBlockStack gap="200">
                <PolarisText variant="bodyMd">
                  {{ isNewUser ? signupData.firstname + ' ' + signupData.lastname : (farmerUser?.firstname || '') + ' ' + (farmerUser?.lastname || '') }}
                </PolarisText>
                <PolarisText variant="bodySm" color="subdued">โทร: {{ telInput }}</PolarisText>
                <template v-if="isNewUser">
                  <PolarisText variant="bodySm" color="subdued">{{ signupData.city }} / {{ signupData.district }} / {{ signupData.subdistrict }}</PolarisText>
                  <PolarisText variant="bodySm" color="subdued">พืช: {{ signupData.crop.map(c => cropLabel(c)).join(', ') }}</PolarisText>
                  <PolarisText variant="bodySm" color="subdued">พื้นที่: {{ signupData.area }} ไร่</PolarisText>
                </template>
                <template v-else-if="profileData.city">
                  <PolarisText variant="bodySm" color="subdued">{{ profileData.city }} / {{ profileData.district }} / {{ profileData.subdistrict }}</PolarisText>
                  <PolarisText variant="bodySm" color="subdued" v-if="profileData.crop?.length">พืช: {{ profileData.crop.map(c => cropLabel(c)).join(', ') }}</PolarisText>
                  <PolarisText variant="bodySm" color="subdued" v-if="profileData.area">พื้นที่: {{ profileData.area }} ไร่</PolarisText>
                </template>
              </PolarisBlockStack>
            </PolarisCardSection>
          </PolarisCard>

          <!-- Section A review -->
          <PolarisCard>
            <PolarisCardHeader title="A) ข้อมูลทั่วไป">
              <template #action>
                <PolarisButton variant="secondary" @click="currentStep = 1">แก้ไข</PolarisButton>
              </template>
            </PolarisCardHeader>
            <PolarisCardSection>
              <div class="rice-survey__review-grid">
                <div class="rice-survey__review-item"><span>อายุ</span><strong>{{ surveyData.a1_age }} ปี</strong></div>
                <div class="rice-survey__review-item"><span>พื้นที่ข้าว</span><strong>{{ surveyData.a2_rice_area_rai }} ไร่</strong></div>
                <div class="rice-survey__review-item"><span>เดือนเก็บเกี่ยว</span><strong>{{ monthLabel(surveyData.a3_harvest_month) }}</strong></div>
                <div class="rice-survey__review-item"><span>ปลูกข้าวมา</span><strong>{{ surveyData.a4_farming_years }} ปี</strong></div>
                <div class="rice-survey__review-item"><span>ฤดู/ปี</span><strong>{{ surveyData.a5_seasons_per_year }}</strong></div>
                <div class="rice-survey__review-item"><span>พันธุ์ข้าว</span><strong>{{ varietySummary }}</strong></div>
                <div class="rice-survey__review-item"><span>ผลผลิต/ไร่</span><strong>{{ surveyData.a7_yield_per_rai }} กก.</strong></div>
                <div class="rice-survey__review-item"><span>ราคาขาย</span><strong>{{ surveyData.a8_selling_price }} บาท/ตัน/เกวียน</strong></div>
                <div class="rice-survey__review-item"><span>จุดคุ้มทุน</span><strong>{{ surveyData.a9_breakeven_price }} บาท/ตัน/เกวียน</strong></div>
              </div>
            </PolarisCardSection>
          </PolarisCard>

          <!-- Section B/C/D review -->
          <PolarisCard>
            <PolarisCardHeader title="B-D) ศัตรูพืช">
              <template #action>
                <PolarisButton variant="secondary" @click="currentStep = 2">แก้ไข</PolarisButton>
              </template>
            </PolarisCardHeader>
            <PolarisCardSection>
              <PolarisBlockStack gap="200">
                <PolarisText variant="bodySm">วัชพืชที่พบ: {{ foundCount(surveyData.b_weed_assessment) }} ชนิด</PolarisText>
                <PolarisText variant="bodySm">แมลง/หนอนที่พบ: {{ foundCount(surveyData.c_insect_assessment) }} ชนิด</PolarisText>
                <PolarisText variant="bodySm">โรคที่พบ: {{ foundCount(surveyData.d_disease_assessment) }} ชนิด</PolarisText>
              </PolarisBlockStack>
            </PolarisCardSection>
          </PolarisCard>

          <!-- Section E review -->
          <PolarisCard>
            <PolarisCardHeader title="E) สารอารักขาพืช">
              <template #action>
                <PolarisButton variant="secondary" @click="currentStep = 5">แก้ไข</PolarisButton>
              </template>
            </PolarisCardHeader>
            <PolarisCardSection>
              <PolarisBlockStack gap="200">
                <PolarisText variant="bodySm">จำนวนการฉีดพ่นทั้งหมด: {{ totalSprays }} ครั้ง</PolarisText>
                <PolarisText variant="bodySm">ค่าใช้จ่ายรวม: {{ surveyData.e6_total_cost || '-' }} บาท</PolarisText>
                <PolarisText variant="bodySm">แผนลงทุน: {{ investmentLabel(surveyData.e7_investment_plan) }}</PolarisText>
              </PolarisBlockStack>
            </PolarisCardSection>
          </PolarisCard>

          <!-- Submit -->
          <PolarisBanner v-if="submitError" variant="critical">
            {{ submitError }}
          </PolarisBanner>

          <PolarisButton
            variant="primary"
            fullWidth
            :loading="isSubmitting"
            @click="handleSubmit"
          >
            ยืนยันและส่งแบบสอบถาม
          </PolarisButton>
        </PolarisBlockStack>
      </div>

      <!-- Survey navigation buttons -->
      <div v-if="currentStep < 6" class="rice-survey__nav">
        <div class="rice-survey__nav-left">
          <PolarisButton
            v-if="currentStep > 1"
            @click="prevStep"
          >
            ย้อนกลับ
          </PolarisButton>
        </div>
        <PolarisButton variant="plain" @click="cancelSurvey">
          ยกเลิก
        </PolarisButton>
        <PolarisButton variant="primary" @click="nextStep">
          ถัดไป
        </PolarisButton>
      </div>
    </div>

    <!-- Cancel confirmation modal -->
    <div v-if="showCancelConfirm" class="rice-survey__modal-overlay" @click.self="showCancelConfirm = false">
      <PolarisCard>
        <PolarisCardHeader title="ยืนยันการยกเลิก" />
        <PolarisCardSection>
          <PolarisBlockStack gap="400">
            <PolarisText variant="bodyMd">ต้องการยกเลิกแบบสอบถาม? ข้อมูลทั้งหมดที่กรอกจะถูกลบ</PolarisText>
            <PolarisInline gap="200">
              <PolarisButton @click="showCancelConfirm = false">กลับไปทำต่อ</PolarisButton>
              <PolarisButton variant="primary" @click="confirmCancel">ยืนยันยกเลิก</PolarisButton>
            </PolarisInline>
          </PolarisBlockStack>
        </PolarisCardSection>
      </PolarisCard>
    </div>

    <!-- Success modal -->
    <div v-if="showSuccessModal" class="rice-survey__modal-overlay">
      <PolarisCard>
        <PolarisCardSection>
          <div class="rice-survey__success-content">
            <div class="rice-survey__success-icon">✓</div>
            <PolarisText variant="headingLg">บันทึกแบบสอบถามเรียบร้อยแล้ว</PolarisText>
            <PolarisText variant="bodySm" color="subdued">ข้อมูลถูกบันทึกเข้าระบบเรียบร้อย</PolarisText>
            <PolarisButton variant="primary" fullWidth @click="closeSuccessAndReset">กลับหน้าหลัก</PolarisButton>
          </div>
        </PolarisCardSection>
      </PolarisCard>
    </div>

    <!-- Debug panel -->
    <div class="rice-survey__debug-toggle">
      <button class="rice-survey__debug-btn" @click="showDebug = !showDebug">
        {{ showDebug ? '▼' : '▶' }} Debug
      </button>
    </div>
    <div v-if="showDebug" class="rice-survey__debug">
      <div
        v-for="(msg, idx) in debugMessages"
        :key="idx"
        class="rice-survey__debug-line"
      >
        <span class="rice-survey__debug-time">[{{ msg.time }}]</span>
        {{ msg.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'
import {
  PolarisCard, PolarisCardHeader, PolarisCardSection,
  PolarisTextField, PolarisSelect, PolarisCheckbox,
  PolarisButton, PolarisBanner, PolarisBadge,
  PolarisText, PolarisBlockStack, PolarisInline,
} from 'polaris-weweb-styles/components'
import {
  FORM_ID, MERCHANT_ID, USER_PROFILE_FORM_ID,
  CROP_FIELD_ID, AREA_FIELD_ID, FIELDS,
  MONTH_OPTIONS, WEED_OPTIONS, INSECT_OPTIONS, DISEASE_OPTIONS,
  GROWTH_STAGES, INVESTMENT_OPTIONS, CROP_OPTIONS, RICE_VARIETY_OPTIONS,
  SURVEY_STEPS, normalizeTel,
  initWeedAssessment, initInsectAssessment, initDiseaseAssessment, initSprayApplications,
} from './constants.js'
import AssessmentMatrix from './components/AssessmentMatrix.vue'
import SprayStagePanel from './components/SprayStagePanel.vue'
import VarietyRepeater from './components/VarietyRepeater.vue'

export default {
  components: {
    PolarisCard, PolarisCardHeader, PolarisCardSection,
    PolarisTextField, PolarisSelect, PolarisCheckbox,
    PolarisButton, PolarisBanner, PolarisBadge,
    PolarisText, PolarisBlockStack, PolarisInline,
    AssessmentMatrix, SprayStagePanel, VarietyRepeater,
  },
  props: {
    uid: { type: String, required: true },
    content: { type: Object, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  setup(props, { emit }) {
    // ─── Supabase client ───
    const supabase = computed(() => {
      const url = props.content?.supabaseUrl || 'https://wkevmsedchftztoolkmi.supabase.co'
      const key = props.content?.supabaseAnonKey || ''
      const token = props.content?.accessToken || ''
      if (!url || !key) return null
      const headers = { 'x-merchant-id': MERCHANT_ID }
      if (token) headers.Authorization = `Bearer ${token}`
      return createClient(url, key, { global: { headers } })
    })

    // ─── Internal variables ───
    const { value: currentPhaseVar, setValue: setCurrentPhaseVar } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'currentPhase',
        type: 'string',
        defaultValue: 'tel_lookup',
      })

    const { value: currentStepVar, setValue: setCurrentStepVar } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'currentStep',
        type: 'number',
        defaultValue: 1,
      })

    const { value: farmerNameVar, setValue: setFarmerNameVar } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'farmerName',
        type: 'string',
        defaultValue: '',
      })

    const { value: isSubmittingVar, setValue: setIsSubmittingVar } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'isSubmitting',
        type: 'boolean',
        defaultValue: false,
      })

    // ─── Phase & step state ───
    const phase = ref('tel_lookup')
    const currentStep = ref(1)
    const totalSteps = 6

    // ─── Tel lookup state ───
    const telInput = ref('')
    const telError = ref('')
    const isLookingUp = ref(false)
    const farmerUser = ref(null)
    const showNotFoundBanner = ref(false)
    const isNewUser = ref(false)

    // ─── Signup state ───
    const signupData = reactive({
      firstname: '',
      lastname: '',
      city: '',
      district: '',
      subdistrict: '',
      province_id: null,
      district_id: null,
      subdistrict_id: null,
      crop: [],
      area: null,
    })
    const signupErrors = reactive({})

    // ─── Address cascading data ───
    const provinces = ref([])
    const districts = ref([])
    const subdistricts = ref([])

    async function fetchProvinces() {
      const client = supabase.value
      if (!client) return
      const { data } = await client
        .from('address_th_province')
        .select('id, province_name_th')
        .order('sort_order')
      provinces.value = (data || []).map(p => ({ value: p.id, label: p.province_name_th }))
    }

    async function fetchDistricts(provinceId) {
      districts.value = []
      subdistricts.value = []
      signupData.district = ''
      signupData.district_id = null
      signupData.subdistrict = ''
      signupData.subdistrict_id = null
      if (!provinceId) return
      const client = supabase.value
      if (!client) return
      const { data } = await client
        .from('address_th_district')
        .select('id, district_name_th')
        .eq('province_id', Number(provinceId))
        .order('sort_order')
      districts.value = (data || []).map(d => ({ value: d.id, label: d.district_name_th }))
    }

    async function fetchSubdistricts(districtId) {
      subdistricts.value = []
      signupData.subdistrict = ''
      signupData.subdistrict_id = null
      if (!districtId) return
      const client = supabase.value
      if (!client) return
      const { data } = await client
        .from('address_th_subdistrict')
        .select('id, subdistrict_name_th')
        .eq('district_id', Number(districtId))
        .order('id')
      subdistricts.value = (data || []).map(s => ({ value: s.id, label: s.subdistrict_name_th }))
    }

    function onProvinceChange(val) {
      const prov = provinces.value.find(p => p.value === val)
      signupData.city = prov?.label || ''
      signupData.province_id = val
      fetchDistricts(val)
    }

    function onDistrictChange(val) {
      const dist = districts.value.find(d => d.value === val)
      signupData.district = dist?.label || ''
      signupData.district_id = val
      signupData.subdistrict_id = null
      signupData.subdistrict = ''
      fetchSubdistricts(val)
    }

    function onSubdistrictChange(val) {
      const sub = subdistricts.value.find(s => s.value === val)
      signupData.subdistrict = sub?.label || ''
      signupData.subdistrict_id = val
    }

    async function getNextAddressCode() {
      const client = supabase.value
      if (!client) return 1
      const { data } = await client
        .from('user_address')
        .select('code')
        .order('code', { ascending: false })
        .limit(1)
        .maybeSingle()
      return (data?.code || 0) + 1
    }

    // ─── Profile edit state (for existing farmers) ───
    const profileData = reactive({
      firstname: '',
      lastname: '',
      city: '',
      district: '',
      subdistrict: '',
      province_id: null,
      district_id: null,
      subdistrict_id: null,
      crop: [],
      area: null,
    })
    const profileErrors = reactive({})
    const isUpdatingProfile = ref(false)
    const profileAddressId = ref(null)
    const profileSubmissionId = ref(null)

    async function fetchFarmerProfile(userId) {
      const client = supabase.value
      if (!client || !userId) return
      debugLog(`Fetching profile for user: ${userId}`)

      try {
        if (!provinces.value.length) await fetchProvinces()

        const { data: addrData } = await client
          .from('user_address')
          .select('id, city, district, subdistrict')
          .eq('user_id', userId)
          .eq('merchant_id', MERCHANT_ID)
          .maybeSingle()

        if (addrData) {
          profileAddressId.value = addrData.id
          const storedProvinceId = addrData.city || null
          const storedDistrictId = addrData.district || null
          const storedSubdistrictId = addrData.subdistrict || null

          if (storedProvinceId) {
            profileData.province_id = storedProvinceId
            const prov = provinces.value.find(p => p.value === storedProvinceId)
            profileData.city = prov?.label || storedProvinceId

            await fetchProfileDistricts(storedProvinceId)

            if (storedDistrictId) {
              profileData.district_id = storedDistrictId
              const dist = profileDistricts.value.find(d => d.value === storedDistrictId)
              profileData.district = dist?.label || storedDistrictId

              await fetchProfileSubdistricts(storedDistrictId)

              if (storedSubdistrictId) {
                profileData.subdistrict_id = storedSubdistrictId
                const sub = profileSubdistricts.value.find(s => s.value === storedSubdistrictId)
                profileData.subdistrict = sub?.label || storedSubdistrictId
              }
            }
          }
          debugLog(`Address loaded: province=${storedProvinceId}, district=${storedDistrictId}, subdistrict=${storedSubdistrictId}`)
        }

        const { data: subData } = await client
          .from('form_submissions')
          .select('id')
          .eq('user_id', userId)
          .eq('form_id', USER_PROFILE_FORM_ID)
          .eq('merchant_id', MERCHANT_ID)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (subData) {
          profileSubmissionId.value = subData.id
          const { data: respData } = await client
            .from('form_responses')
            .select('field_id, text_value, array_value')
            .eq('submission_id', subData.id)

          if (respData) {
            const cropResp = respData.find(r => r.field_id === CROP_FIELD_ID)
            const areaResp = respData.find(r => r.field_id === AREA_FIELD_ID)
            if (cropResp?.array_value) profileData.crop = cropResp.array_value
            if (areaResp?.text_value) profileData.area = Number(areaResp.text_value)
          }
        }

        debugLog('Profile fetched successfully')
      } catch (err) {
        debugLog(`Profile fetch error: ${err?.message}`)
        showNotification('error', 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้')
      }
    }

    const profileDistricts = ref([])
    const profileSubdistricts = ref([])

    async function fetchProfileDistricts(provinceId) {
      profileDistricts.value = []
      profileSubdistricts.value = []
      if (!provinceId) return
      const client = supabase.value
      if (!client) return
      const { data } = await client
        .from('address_th_district')
        .select('id, district_name_th')
        .eq('province_id', Number(provinceId))
        .order('sort_order')
      profileDistricts.value = (data || []).map(d => ({ value: d.id, label: d.district_name_th }))
    }

    async function fetchProfileSubdistricts(districtId) {
      profileSubdistricts.value = []
      if (!districtId) return
      const client = supabase.value
      if (!client) return
      const { data } = await client
        .from('address_th_subdistrict')
        .select('id, subdistrict_name_th')
        .eq('district_id', Number(districtId))
        .order('id')
      profileSubdistricts.value = (data || []).map(s => ({ value: s.id, label: s.subdistrict_name_th }))
    }

    function onProfileProvinceChange(val) {
      const prov = provinces.value.find(p => p.value === val)
      profileData.city = prov?.label || ''
      profileData.province_id = val
      profileData.district = ''
      profileData.district_id = null
      profileData.subdistrict = ''
      profileData.subdistrict_id = null
      fetchProfileDistricts(val)
    }

    function onProfileDistrictChange(val) {
      const dist = profileDistricts.value.find(d => d.value === val)
      profileData.district = dist?.label || ''
      profileData.district_id = val
      profileData.subdistrict = ''
      profileData.subdistrict_id = null
      fetchProfileSubdistricts(val)
    }

    function onProfileSubdistrictChange(val) {
      const sub = profileSubdistricts.value.find(s => s.value === val)
      profileData.subdistrict = sub?.label || ''
      profileData.subdistrict_id = val
    }

    function toggleProfileCrop(value, checked) {
      if (checked) {
        if (!profileData.crop.includes(value)) profileData.crop.push(value)
      } else {
        profileData.crop = profileData.crop.filter(v => v !== value)
      }
    }

    async function validateAndUpdateProfile() {
      const errs = {}
      if (!profileData.firstname?.trim()) errs.firstname = 'กรุณากรอกชื่อ'
      if (!profileData.lastname?.trim()) errs.lastname = 'กรุณากรอกนามสกุล'
      if (!profileData.province_id) errs.city = 'กรุณาเลือกจังหวัด'
      if (!profileData.district_id) errs.district = 'กรุณาเลือกอำเภอ'
      if (!profileData.subdistrict_id) errs.subdistrict = 'กรุณาเลือกตำบล'
      if (!profileData.crop?.length) errs.crop = 'กรุณาเลือกพืชที่ปลูกอย่างน้อย 1 ชนิด'
      if (!profileData.area || profileData.area <= 0) errs.area = 'กรุณากรอกพื้นที่'

      Object.keys(profileErrors).forEach(k => delete profileErrors[k])
      Object.assign(profileErrors, errs)

      if (Object.keys(errs).length) {
        showNotification('warning', 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ')
        return
      }

      isUpdatingProfile.value = true
      const farmerId = farmerUser.value?.id
      const errors = []

      try {
        const client = supabase.value
        if (!client) throw new Error('Supabase not configured')

        debugLog('Updating farmer profile...')

        const { error: userErr } = await client
          .from('user_accounts')
          .update({ firstname: profileData.firstname, lastname: profileData.lastname })
          .eq('id', farmerId)
          .eq('merchant_id', MERCHANT_ID)
        if (userErr) errors.push(`ชื่อ: ${userErr.message}`)

        const addressPayload = {
          city: String(profileData.province_id),
          district: String(profileData.district_id),
          subdistrict: String(profileData.subdistrict_id),
        }

        if (profileAddressId.value) {
          const { error: addrErr } = await client
            .from('user_address')
            .update(addressPayload)
            .eq('id', profileAddressId.value)
          if (addrErr) errors.push(`ที่อยู่: ${addrErr.message}`)
        } else {
          const nextCode = await getNextAddressCode()
          const { error: addrErr } = await client.from('user_address').insert({
            ...addressPayload,
            code: nextCode,
            user_id: farmerId,
            merchant_id: MERCHANT_ID,
          })
          if (addrErr) errors.push(`ที่อยู่: ${addrErr.message}`)
        }

        if (profileSubmissionId.value) {
          const { error: cropErr } = await client.from('form_responses')
            .update({ array_value: profileData.crop })
            .eq('submission_id', profileSubmissionId.value)
            .eq('field_id', CROP_FIELD_ID)
          if (cropErr) errors.push(`พืช: ${cropErr.message}`)

          const { error: areaErr } = await client.from('form_responses')
            .update({ text_value: String(profileData.area) })
            .eq('submission_id', profileSubmissionId.value)
            .eq('field_id', AREA_FIELD_ID)
          if (areaErr) errors.push(`พื้นที่: ${areaErr.message}`)
        } else {
          const { data: newSub, error: subErr } = await client
            .from('form_submissions')
            .insert({
              form_id: USER_PROFILE_FORM_ID,
              merchant_id: MERCHANT_ID,
              user_id: farmerId,
              status: 'completed',
              source: 'field_interview',
              submitted_at: new Date().toISOString(),
              ref_userid: props.content?.userId || null,
            })
            .select('id')
            .single()

          if (subErr) {
            errors.push(`โปรไฟล์: ${subErr.message}`)
          } else if (newSub) {
            profileSubmissionId.value = newSub.id
            const { error: respErr } = await client.from('form_responses').insert([
              { submission_id: newSub.id, field_id: CROP_FIELD_ID, array_value: profileData.crop },
              { submission_id: newSub.id, field_id: AREA_FIELD_ID, text_value: String(profileData.area) },
            ])
            if (respErr) errors.push(`ข้อมูลพืช/พื้นที่: ${respErr.message}`)
          }
        }

        if (errors.length) {
          debugLog(`Profile update errors: ${errors.join('; ')}`)
          showNotification('error', `บันทึกไม่สำเร็จบางส่วน: ${errors.join(', ')}`)
          return
        }

        farmerUser.value = { ...farmerUser.value, firstname: profileData.firstname, lastname: profileData.lastname }
        setFarmerNameVar(`${profileData.firstname} ${profileData.lastname}`)

        debugLog('Profile updated successfully')
        showNotification('success', 'อัปเดตข้อมูลเรียบร้อย')

        emit('trigger-event', {
          name: 'profile-updated',
          event: { farmerId, updatedFields: ['name', 'address', 'crop', 'area'] },
        })

        startSurvey()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        debugLog(`Profile update ERROR: ${msg}`)
        showNotification('error', `อัปเดตข้อมูลไม่สำเร็จ: ${msg}`)
      } finally {
        isUpdatingProfile.value = false
      }
    }

    // ─── Survey state ───
    const surveyData = reactive({
      a1_age: null,
      a2_rice_area_rai: null,
      a3_harvest_month: null,
      a4_farming_years: null,
      a5_seasons_per_year: null,
      a6_rice_varieties: [{ variety: '', custom_variety: '', harvest_days: null }],
      a7_yield_per_rai: null,
      a8_selling_price: null,
      a9_breakeven_price: null,
      b_weed_assessment: initWeedAssessment(),
      c_insect_assessment: initInsectAssessment(),
      d_disease_assessment: initDiseaseAssessment(),
      e1_e5_spray_applications: initSprayApplications(),
      e6_total_cost: null,
      e6_1_herbicide_pct: null,
      e6_2_insecticide_pct: null,
      e6_3_fungicide_pct: null,
      e6_4_hormone_pct: null,
      e7_investment_plan: null,
    })
    const stepErrors = reactive({})

    // ─── UI state ───
    const isSubmitting = ref(false)
    const submitError = ref(null)
    const notifications = ref([])
    const debugMessages = ref([])
    const showDebug = ref(false)
    const showCancelConfirm = ref(false)
    const showSuccessModal = ref(false)
    const lastSubmissionId = ref(null)

    // ─── Computed ───
    const currentStepTitle = computed(() =>
      SURVEY_STEPS.find(s => s.id === currentStep.value)?.title || ''
    )
    const progressPct = computed(() => (currentStep.value / totalSteps) * 100)

    const monthOptions = computed(() => MONTH_OPTIONS)
    const weedOptions = computed(() => WEED_OPTIONS)
    const insectOptions = computed(() => INSECT_OPTIONS)
    const diseaseOptions = computed(() => DISEASE_OPTIONS)
    const growthStages = computed(() => GROWTH_STAGES)
    const investmentOptions = computed(() => INVESTMENT_OPTIONS)
    const cropOptions = computed(() => CROP_OPTIONS)

    const costPctSum = computed(() => {
      return (surveyData.e6_1_herbicide_pct || 0) +
        (surveyData.e6_2_insecticide_pct || 0) +
        (surveyData.e6_3_fungicide_pct || 0) +
        (surveyData.e6_4_hormone_pct || 0)
    })

    const varietySummary = computed(() => {
      const vars = surveyData.a6_rice_varieties?.filter(v => v?.variety) || []
      return vars.map(v => v.variety === 'other' ? (v.custom_variety || 'อื่นๆ') : v.variety).join(', ') || '-'
    })

    const totalSprays = computed(() => {
      const stages = surveyData.e1_e5_spray_applications?.stages || {}
      return Object.values(stages).reduce((sum, s) => sum + (s?.total_sprays || 0), 0)
    })

    // ─── Debug ───
    function debugLog(message) {
      const time = new Date().toLocaleTimeString('th-TH')
      debugMessages.value.push({ time, message })
    }

    // ─── Notifications ───
    function showNotification(type, message) {
      const id = Date.now().toString()
      notifications.value.push({ id, type, message, timestamp: Date.now() })
      const delay = type === 'error' ? 8000 : type === 'warning' ? 4000 : 3000
      setTimeout(() => dismissNotification(id), delay)
    }

    function dismissNotification(id) {
      notifications.value = notifications.value.filter(n => n.id !== id)
    }

    // ─── Tel lookup ───
    async function lookupFarmer() {
      const raw = telInput.value?.trim()
      if (!raw || raw.replace(/[\s\-]/g, '').length < 9) {
        telError.value = 'กรุณากรอกหมายเลขโทรศัพท์ 9-10 หลัก'
        return
      }
      telError.value = ''
      const normalized = normalizeTel(raw)
      isLookingUp.value = true
      farmerUser.value = null
      showNotFoundBanner.value = false
      debugLog(`Tel lookup: ${normalized}`)

      try {
        const client = supabase.value
        if (!client) throw new Error('Supabase not configured')

        const { data, error } = await client
          .from('user_accounts')
          .select('id, firstname, lastname, tel, merchant_id')
          .eq('merchant_id', MERCHANT_ID)
          .eq('tel', normalized)
          .maybeSingle()

        if (error) throw error

        if (data) {
          farmerUser.value = data
          isNewUser.value = false
          setFarmerNameVar(`${data.firstname} ${data.lastname}`)
          debugLog(`User found: ${data.id} (${data.firstname} ${data.lastname})`)
          showNotification('success', `พบข้อมูล: ${data.firstname} ${data.lastname}`)
        } else {
          showNotFoundBanner.value = true
          debugLog('User not found, showing signup form')
          showNotification('info', 'ไม่พบข้อมูลในระบบ กรุณากรอกข้อมูลลงทะเบียน')
        }
      } catch (err) {
        const msg = err?.message || 'ไม่สามารถค้นหาได้'
        telError.value = msg
        debugLog(`Lookup error: ${msg}`)
        showNotification('error', `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่`)
      } finally {
        isLookingUp.value = false
      }
    }

    // ─── Phase transitions ───
    async function goToProfileReview() {
      profileData.firstname = farmerUser.value?.firstname || ''
      profileData.lastname = farmerUser.value?.lastname || ''
      profileData.city = ''
      profileData.district = ''
      profileData.subdistrict = ''
      profileData.province_id = null
      profileData.district_id = null
      profileData.subdistrict_id = null
      profileData.crop = []
      profileData.area = null
      profileAddressId.value = null
      profileSubmissionId.value = null
      profileDistricts.value = []
      profileSubdistricts.value = []
      Object.keys(profileErrors).forEach(k => delete profileErrors[k])

      phase.value = 'profile_review'
      setCurrentPhaseVar('profile_review')
      emit('trigger-event', { name: 'phase-changed', event: { phase: 'profile_review' } })

      await fetchFarmerProfile(farmerUser.value?.id)
    }

    function goToSignup() {
      isNewUser.value = true
      phase.value = 'signup'
      setCurrentPhaseVar('signup')
      emit('trigger-event', { name: 'phase-changed', event: { phase: 'signup' } })
    }

    function startSurvey() {
      phase.value = 'survey'
      currentStep.value = 1
      setCurrentPhaseVar('survey')
      setCurrentStepVar(1)
      emit('trigger-event', { name: 'phase-changed', event: { phase: 'survey' } })
      debugLog('Survey started')
    }

    const isCreatingUser = ref(false)

    async function validateAndCreateUser() {
      const errs = {}
      if (!signupData.firstname?.trim()) errs.firstname = 'กรุณากรอกชื่อ'
      if (!signupData.lastname?.trim()) errs.lastname = 'กรุณากรอกนามสกุล'
      if (!signupData.province_id) errs.city = 'กรุณาเลือกจังหวัด'
      if (!signupData.district_id) errs.district = 'กรุณาเลือกอำเภอ'
      if (!signupData.subdistrict_id) errs.subdistrict = 'กรุณาเลือกตำบล'
      if (!signupData.crop?.length) errs.crop = 'กรุณาเลือกพืชที่ปลูกอย่างน้อย 1 ชนิด'
      if (!signupData.area || signupData.area <= 0) errs.area = 'กรุณากรอกพื้นที่'

      Object.keys(signupErrors).forEach(k => delete signupErrors[k])
      Object.assign(signupErrors, errs)

      if (Object.keys(errs).length) {
        showNotification('warning', 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ')
        return
      }

      isCreatingUser.value = true
      const normalized = normalizeTel(telInput.value)

      try {
        const client = supabase.value
        if (!client) throw new Error('Supabase not configured')

        debugLog('Creating new user account...')

        const { data: newUser, error: userErr } = await client
          .from('user_accounts')
          .insert({
            merchant_id: MERCHANT_ID,
            tel: normalized,
            firstname: signupData.firstname,
            lastname: signupData.lastname,
            is_signup_form_complete: true,
          })
          .select('id')
          .single()

        if (userErr) throw new Error(`User creation failed: ${userErr.message}`)
        const farmerId = newUser.id
        debugLog(`User created: ${farmerId}`)

        const nextCode = await getNextAddressCode()
        const { error: addrErr } = await client
          .from('user_address')
          .insert({
            code: nextCode,
            user_id: farmerId,
            merchant_id: MERCHANT_ID,
            city: String(signupData.province_id),
            district: String(signupData.district_id),
            subdistrict: String(signupData.subdistrict_id),
          })
        if (addrErr) debugLog(`Address insert warning: ${addrErr.message}`)
        else debugLog('Address saved')

        const { data: profileSub, error: profSubErr } = await client
          .from('form_submissions')
          .insert({
            form_id: USER_PROFILE_FORM_ID,
            merchant_id: MERCHANT_ID,
            user_id: farmerId,
            status: 'completed',
            source: 'field_interview',
            submitted_at: new Date().toISOString(),
            ref_userid: props.content?.userId || null,
          })
          .select('id')
          .single()

        if (!profSubErr && profileSub) {
          await client.from('form_responses').insert([
            { submission_id: profileSub.id, field_id: CROP_FIELD_ID, array_value: signupData.crop },
            { submission_id: profileSub.id, field_id: AREA_FIELD_ID, text_value: String(signupData.area) },
          ])
        }

        debugLog('Signup data saved')
        showNotification('success', 'สร้างบัญชีเกษตรกรเรียบร้อย')

        farmerUser.value = { id: farmerId, firstname: signupData.firstname, lastname: signupData.lastname }
        setFarmerNameVar(`${signupData.firstname} ${signupData.lastname}`)
        startSurvey()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        debugLog(`Signup ERROR: ${msg}`)
        showNotification('error', `สร้างบัญชีไม่สำเร็จ: ${msg}`)
        emit('trigger-event', { name: 'error', event: { message: msg } })
      } finally {
        isCreatingUser.value = false
      }
    }

    // ─── Crop toggle ───
    function toggleCrop(value, checked) {
      if (checked) {
        if (!signupData.crop.includes(value)) signupData.crop.push(value)
      } else {
        signupData.crop = signupData.crop.filter(v => v !== value)
      }
    }

    // ─── Step navigation ───
    function validateCurrentStep() {
      const errs = {}

      if (currentStep.value === 1) {
        if (surveyData.a1_age == null || surveyData.a1_age < 15 || surveyData.a1_age > 99)
          errs.a1_age = 'กรุณากรอกอายุ (15-99 ปี)'
        if (surveyData.a2_rice_area_rai == null || surveyData.a2_rice_area_rai < 1)
          errs.a2_rice_area_rai = 'กรุณากรอกพื้นที่ (≥ 1 ไร่)'
        if (!surveyData.a3_harvest_month)
          errs.a3_harvest_month = 'กรุณาเลือกเดือน'
        if (surveyData.a4_farming_years == null || surveyData.a4_farming_years < 1)
          errs.a4_farming_years = 'กรุณากรอกจำนวนปี'
        if (surveyData.a5_seasons_per_year == null || surveyData.a5_seasons_per_year < 1 || surveyData.a5_seasons_per_year > 4)
          errs.a5_seasons_per_year = 'กรุณากรอกจำนวนฤดู (1-4)'
        const validVarieties = (surveyData.a6_rice_varieties || []).filter(v => {
          if (!v?.variety) return false
          if (v.variety === 'other') return !!v.custom_variety?.trim()
          return true
        })
        if (!validVarieties.length)
          errs.a6_rice_varieties = 'กรุณาเลือกพันธุ์ข้าวอย่างน้อย 1 รายการ'
        if (surveyData.a7_yield_per_rai == null || surveyData.a7_yield_per_rai < 0)
          errs.a7_yield_per_rai = 'กรุณากรอกผลผลิต'
        if (surveyData.a8_selling_price == null || surveyData.a8_selling_price < 0)
          errs.a8_selling_price = 'กรุณากรอกราคาขาย'
        if (surveyData.a9_breakeven_price == null || surveyData.a9_breakeven_price < 0)
          errs.a9_breakeven_price = 'กรุณากรอกราคาขั้นต่ำ'
      }

      if (currentStep.value >= 2 && currentStep.value <= 4) {
        const data = currentStep.value === 2
          ? surveyData.b_weed_assessment
          : currentStep.value === 3
            ? surveyData.c_insect_assessment
            : surveyData.d_disease_assessment

        const items = data?.items || []
        const hasStages = currentStep.value !== 2
        items.forEach((item, i) => {
          if (item.found) {
            if (item.damage == null)
              errs[`item_${i}_damage`] = 'true'
            if (item.control_difficulty == null)
              errs[`item_${i}_control`] = 'true'
            if (hasStages && (!item.stages || item.stages.length === 0))
              errs[`item_${i}_stages`] = 'true'
          }
        })
        const checkedErrors = Object.keys(errs).filter(k => k.startsWith('item_'))
        if (checkedErrors.length) {
          errs._assessment = 'กรุณาให้คะแนนรายการที่เลือกให้ครบ'
        }
      }

      if (currentStep.value === 5) {
        if (!surveyData.e7_investment_plan)
          errs.e7_investment_plan = 'กรุณาเลือกแผนการลงทุน'

        const stages = surveyData.e1_e5_spray_applications?.stages || {}
        Object.entries(stages).forEach(([stageKey, stageData]) => {
          const sprays = stageData?.total_sprays || 0
          const apps = stageData?.applications || []
          for (let i = 0; i < sprays; i++) {
            const app = apps[i]
            if (!app) continue
            if (!app.product?.trim())
              errs[`spray_${stageKey}_${i}_product`] = 'true'
            if (!app.type)
              errs[`spray_${stageKey}_${i}_type`] = 'true'
            if (app.amount == null || app.amount === '')
              errs[`spray_${stageKey}_${i}_amount`] = 'true'
          }
        })
        const sprayErrors = Object.keys(errs).filter(k => k.startsWith('spray_'))
        if (sprayErrors.length) {
          errs._spray = 'กรุณากรอกข้อมูลสารที่ใช้ให้ครบทุกครั้งที่ฉีดพ่น'
        }
      }

      Object.keys(stepErrors).forEach(k => delete stepErrors[k])
      Object.assign(stepErrors, errs)
      return Object.keys(errs).length === 0
    }

    function nextStep() {
      if (!validateCurrentStep()) {
        showNotification('warning', 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ')
        return
      }
      if (currentStep.value < totalSteps) {
        currentStep.value++
        setCurrentStepVar(currentStep.value)
        emit('trigger-event', { name: 'step-changed', event: { step: currentStep.value } })
      }
    }

    function prevStep() {
      if (currentStep.value > 1) {
        currentStep.value--
        setCurrentStepVar(currentStep.value)
        emit('trigger-event', { name: 'step-changed', event: { step: currentStep.value } })
      }
    }

    function validateAllSteps() {
      const savedStep = currentStep.value
      for (let step = 1; step <= 5; step++) {
        currentStep.value = step
        if (!validateCurrentStep()) {
          setCurrentStepVar(step)
          emit('trigger-event', { name: 'step-changed', event: { step } })
          return step
        }
      }
      currentStep.value = savedStep
      setCurrentStepVar(savedStep)
      return null
    }

    // ─── Spray stage update ───
    function updateSprayStage(key, data) {
      if (!surveyData.e1_e5_spray_applications) {
        surveyData.e1_e5_spray_applications = initSprayApplications()
      }
      surveyData.e1_e5_spray_applications.stages[key] = data
    }

    // ─── Helpers ───
    function monthLabel(val) {
      return MONTH_OPTIONS.find(m => m.value === val)?.label || '-'
    }
    function investmentLabel(val) {
      return INVESTMENT_OPTIONS.find(o => o.value === val)?.label || '-'
    }
    function cropLabel(val) {
      return CROP_OPTIONS.find(o => o.value === val)?.label || val
    }
    function foundCount(assessment) {
      return (assessment?.items || []).filter(i => i?.found).length
    }

    // ─── Build responses ───
    function buildResponses(submissionId) {
      const responses = []

      const simpleMap = {
        a1_age: surveyData.a1_age,
        a2_rice_area_rai: surveyData.a2_rice_area_rai,
        a3_harvest_month: surveyData.a3_harvest_month,
        a4_farming_years: surveyData.a4_farming_years,
        a5_seasons_per_year: surveyData.a5_seasons_per_year,
        a7_yield_per_rai: surveyData.a7_yield_per_rai,
        a8_selling_price: surveyData.a8_selling_price,
        a9_breakeven_price: surveyData.a9_breakeven_price,
        e6_total_cost: surveyData.e6_total_cost,
        e6_1_herbicide_pct: surveyData.e6_1_herbicide_pct,
        e6_2_insecticide_pct: surveyData.e6_2_insecticide_pct,
        e6_3_fungicide_pct: surveyData.e6_3_fungicide_pct,
        e6_4_hormone_pct: surveyData.e6_4_hormone_pct,
        e7_investment_plan: surveyData.e7_investment_plan,
      }

      for (const [key, value] of Object.entries(simpleMap)) {
        if (value !== null && value !== undefined && value !== '') {
          responses.push({
            submission_id: submissionId,
            field_id: FIELDS[key].id,
            text_value: String(value),
          })
        }
      }

      const complexMap = {
        a6_rice_varieties: (surveyData.a6_rice_varieties || [])
          .filter(v => v?.variety)
          .map(v => ({
            variety: v.variety === 'other' ? (v.custom_variety || 'อื่นๆ') : v.variety,
            harvest_days: v.harvest_days,
          })),
        b_weed_assessment: surveyData.b_weed_assessment,
        c_insect_assessment: surveyData.c_insect_assessment,
        d_disease_assessment: surveyData.d_disease_assessment,
        e1_e5_spray_applications: surveyData.e1_e5_spray_applications,
      }

      for (const [key, value] of Object.entries(complexMap)) {
        if (value !== null && value !== undefined) {
          responses.push({
            submission_id: submissionId,
            field_id: FIELDS[key].id,
            object_value: value,
          })
        }
      }

      return responses
    }

    // ─── Submit ───
    async function handleSubmit() {
      const failedStep = validateAllSteps()
      if (failedStep != null) {
        showNotification('warning', `กรุณากรอกข้อมูลในขั้นตอนที่ ${failedStep} ให้ครบก่อนส่ง`)
        debugLog(`Validation failed at step ${failedStep}`)
        return
      }
      currentStep.value = 6
      setCurrentStepVar(6)

      isSubmitting.value = true
      setIsSubmittingVar(true)
      submitError.value = null
      debugLog('Starting submission...')

      try {
        const client = supabase.value
        if (!client) throw new Error('Supabase not configured')

        const farmerId = farmerUser.value?.id
        if (!farmerId) throw new Error('Farmer user not found — please go back and register first')
        const normalized = normalizeTel(telInput.value)

        debugLog('Creating survey submission...')
        const { data: submission, error: subErr } = await client
          .from('form_submissions')
          .insert({
            form_id: FORM_ID,
            merchant_id: MERCHANT_ID,
            user_id: farmerId,
            status: 'completed',
            source: props.content?.source || 'field_interview',
            submitted_at: new Date().toISOString(),
            ref_userid: props.content?.userId || null,
            tel: normalized,
          })
          .select('id')
          .single()

        if (subErr) throw new Error(`Submission creation failed: ${subErr.message}`)
        debugLog(`Submission created: ${submission.id}`)

        const responses = buildResponses(submission.id)
        debugLog(`Inserting ${responses.length} responses...`)

        const { error: respErr } = await client
          .from('form_responses')
          .insert(responses)

        if (respErr) throw new Error(`Response insert failed: ${respErr.message}`)

        debugLog('Submission complete!')

        emit('trigger-event', {
          name: 'survey-completed',
          event: { submissionId: submission.id, farmerId, isNewUser: isNewUser.value },
        })

        lastSubmissionId.value = submission.id
        showSuccessModal.value = true
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        submitError.value = msg
        debugLog(`ERROR: ${msg}`)
        showNotification('error', `เกิดข้อผิดพลาด: ${msg}`)
        emit('trigger-event', { name: 'error', event: { message: msg } })
      } finally {
        isSubmitting.value = false
        setIsSubmittingVar(false)
      }
    }

    function cancelSurvey() {
      showCancelConfirm.value = true
    }

    function confirmCancel() {
      showCancelConfirm.value = false
      reset()
      emit('trigger-event', { name: 'survey-closed', event: {} })
    }

    function closeSuccessAndReset() {
      showSuccessModal.value = false
      lastSubmissionId.value = null
      reset()
    }

    // ─── Reset action ───
    function reset() {
      phase.value = 'tel_lookup'
      currentStep.value = 1
      telInput.value = ''
      telError.value = ''
      farmerUser.value = null
      showNotFoundBanner.value = false
      isNewUser.value = false
      submitError.value = null

      Object.assign(signupData, {
        firstname: '', lastname: '', city: '', district: '', subdistrict: '',
        province_id: null, district_id: null, crop: [], area: null,
      })
      districts.value = []
      subdistricts.value = []

      Object.assign(surveyData, {
        a1_age: null, a2_rice_area_rai: null, a3_harvest_month: null,
        a4_farming_years: null, a5_seasons_per_year: null,
        a6_rice_varieties: [{ variety: '', custom_variety: '', harvest_days: null }],
        a7_yield_per_rai: null, a8_selling_price: null, a9_breakeven_price: null,
        b_weed_assessment: initWeedAssessment(),
        c_insect_assessment: initInsectAssessment(),
        d_disease_assessment: initDiseaseAssessment(),
        e1_e5_spray_applications: initSprayApplications(),
        e6_total_cost: null, e6_1_herbicide_pct: null,
        e6_2_insecticide_pct: null, e6_3_fungicide_pct: null,
        e6_4_hormone_pct: null, e7_investment_plan: null,
      })

      Object.keys(signupErrors).forEach(k => delete signupErrors[k])
      Object.keys(stepErrors).forEach(k => delete stepErrors[k])
      notifications.value = []
      debugMessages.value = []
      showCancelConfirm.value = false
      showSuccessModal.value = false
      lastSubmissionId.value = null

      setCurrentPhaseVar('tel_lookup')
      setCurrentStepVar(1)
      setFarmerNameVar('')
      debugLog('Survey reset')
    }

    // ─── Sync internal vars ───
    watch(phase, (val) => setCurrentPhaseVar(val))
    watch(currentStep, (val) => setCurrentStepVar(val))

    // ─── Lifecycle ───
    onMounted(() => {
      debugLog(`Component mounted, interviewer: ${props.content?.userId || 'unknown'}`)
      fetchProvinces()
    })

    // ─── Expose for WeWeb actions ───
    // eslint-disable-next-line no-undef
    if (typeof wwLib !== 'undefined') {
      /* wwEditor:start */
      // eslint-disable-next-line no-undef
      const { setExpose } = wwLib.useExpose?.() || {}
      if (setExpose) {
        setExpose({ reset })
      }
      /* wwEditor:end */
    }

    return {
      phase, currentStep, totalSteps,
      telInput, telError, isLookingUp, farmerUser, showNotFoundBanner, isNewUser,
      signupData, signupErrors,
      provinces, districts, subdistricts,
      onProvinceChange, onDistrictChange, onSubdistrictChange,
      surveyData, stepErrors,
      isSubmitting, submitError,
      notifications, debugMessages, showDebug,
      currentStepTitle, progressPct,
      monthOptions, weedOptions, insectOptions, diseaseOptions,
      growthStages, investmentOptions, cropOptions,
      costPctSum, varietySummary, totalSprays,
      lookupFarmer, goToSignup, goToProfileReview, startSurvey,
      validateAndCreateUser, isCreatingUser,
      profileData, profileErrors, isUpdatingProfile,
      profileDistricts, profileSubdistricts,
      onProfileProvinceChange, onProfileDistrictChange, onProfileSubdistrictChange,
      toggleProfileCrop, validateAndUpdateProfile,
      toggleCrop,
      nextStep, prevStep, validateAllSteps, updateSprayStage,
      monthLabel, investmentLabel, cropLabel, foundCount,
      handleSubmit, dismissNotification, reset, cancelSurvey, confirmCancel,
      showCancelConfirm, showSuccessModal, lastSubmissionId, closeSuccessAndReset,
    }
  },
}
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.rice-survey {
  @include polaris-tokens;
  font-family: var(--p-font-family-sans);
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: var(--p-space-400);
  display: flex;
  flex-direction: column;
  gap: var(--p-space-400);

  :deep(input[type="radio"]),
  :deep(input[type="checkbox"]) {
    accent-color: var(--p-color-bg-fill-brand, #2C6ECB);
  }

  &__notifications {
    position: fixed;
    top: var(--p-space-400);
    right: var(--p-space-400);
    z-index: 999;
    display: flex;
    flex-direction: column;
    gap: var(--p-space-200);
    width: 360px;
    max-width: calc(100vw - 32px);
  }

  &__phase {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-400);
  }

  &__form-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--p-space-300);

    @media (min-width: 600px) {
      grid-template-columns: 1fr 1fr;
    }

    &--3col {
      @media (min-width: 600px) {
        grid-template-columns: 1fr 1fr 1fr;
      }
    }
  }

  &__crop-section {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-200);
  }

  &__crop-checks {
    display: flex;
    flex-wrap: wrap;
    gap: var(--p-space-200) var(--p-space-400);
  }

  &__progress {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-100);
  }

  &__progress-bar {
    height: 6px;
    background: var(--p-color-bg-surface-secondary);
    border-radius: var(--p-border-radius-full);
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background: var(--p-color-bg-fill-brand, #2C6ECB);
    border-radius: var(--p-border-radius-full);
    transition: width var(--p-motion-duration-250) var(--p-motion-ease);
  }

  &__step {
    display: flex;
    flex-direction: column;
    gap: var(--p-space-400);
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: var(--p-space-200);
    padding-top: var(--p-space-300);
    border-top: var(--p-border-width-025) solid var(--p-color-border);
  }

  &__nav-left {
    flex: 1;
  }

  &__review-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--p-space-200);

    @media (min-width: 600px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__review-item {
    display: flex;
    justify-content: space-between;
    padding: var(--p-space-150) 0;
    border-bottom: var(--p-border-width-025) solid var(--p-color-border);
    font-size: var(--p-font-size-300);

    span { color: var(--p-color-text-secondary); }
    strong { color: var(--p-color-text); font-weight: var(--p-font-weight-semibold); }
  }

  &__modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    padding: var(--p-space-400);
  }

  &__success-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--p-space-400);
    padding: var(--p-space-600) var(--p-space-400);
    text-align: center;
  }

  &__success-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--p-color-bg-fill-success, #AEE9D1);
    color: var(--p-color-text-success, #1A7346);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: var(--p-font-weight-bold);
  }

  &__debug-toggle {
    display: flex;
    justify-content: flex-end;
  }

  &__debug-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--p-font-size-275);
    color: var(--p-color-text-secondary);
    font-family: var(--p-font-family-mono);
    padding: var(--p-space-100) var(--p-space-200);
    border-radius: var(--p-border-radius-100);

    &:hover { background: var(--p-color-bg-surface-hover); }
  }

  &__debug {
    max-height: 200px;
    overflow-y: auto;
    background: var(--p-color-bg-surface-secondary);
    border: var(--p-border-width-025) solid var(--p-color-border);
    border-radius: var(--p-border-radius-200);
    padding: var(--p-space-200);
    font-family: var(--p-font-family-mono);
    font-size: 11px;
    line-height: 1.5;
  }

  &__debug-line {
    white-space: nowrap;
  }

  &__debug-time {
    color: var(--p-color-text-secondary);
    margin-right: var(--p-space-100);
  }
}
</style>
