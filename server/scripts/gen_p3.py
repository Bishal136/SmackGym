import os

base_dir = '/home/bishal/BishalHome/Cours/Ecommarce/SMACKGYM/server/postman/collections/SMACKGYM Phase P3 API'
os.makedirs(f'{base_dir}/.resources', exist_ok=True)

with open(f'{base_dir}/.resources/definition.yaml', 'w') as f:
    f.write('$kind: collection\n')

def write_req(filename, name, order, method, url, headers=None, body_json=None, before_script=None, after_script=None):
    lines = [
        "$kind: http-request",
        f"name: '{name}'",
        f"order: {order}",
        f"method: {method}",
        f"url: '{url}'"
    ]
    if headers:
        lines.append("headers:")
        for h in headers:
            lines.append(f"  - key: {h['key']}")
            lines.append(f"    value: {h['value']}")
    if body_json:
        lines.append("body:")
        lines.append("  type: json")
        lines.append("  content: |-")
        for bl in body_json.strip().split('\n'):
            lines.append(f"    {bl}")
    if before_script or after_script:
        lines.append("scripts:")
        if before_script:
            lines.append("  - type: beforeRequest")
            lines.append("    code: |-")
            for sl in before_script.strip().split('\n'):
                lines.append(f"      {sl}")
        if after_script:
            lines.append("  - type: afterResponse")
            lines.append("    code: |-")
            for sl in after_script.strip().split('\n'):
                lines.append(f"      {sl}")
    
    with open(os.path.join(base_dir, filename), 'w') as f:
        f.write('\n'.join(lines) + '\n')
    print(f"Generated {filename}")

# 01
write_req(
    '01-create-coach-session.request.yaml',
    'P3 Coach Setup & Registration',
    1000,
    'POST',
    '{{baseUrl}}/v1/auth/register',
    headers=[{'key': 'Content-Type', 'value': 'application/json'}],
    body_json='''{
  "email": "{{p3CoachEmail}}",
  "password": "CoachPass2026!",
  "fullName": "Head Coach Marcus",
  "role": "COACH",
  "mode": "professional",
  "is18Plus": true,
  "birthDate": "1988-03-12T00:00:00.000Z",
  "consentGiven": true
}''',
    before_script='''const uniqueEmail = "coach_" + Date.now() + "@test.smackgym.co.uk";
pm.environment.set("p3CoachEmail", uniqueEmail);''',
    after_script='''pm.test("Status code is 201 Created", function () {
  pm.response.to.have.status(201);
});
pm.test("Coach session token saved", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.data.user.role).to.eql("COACH");
  pm.environment.set("p3CoachToken", json.data.tokens.accessToken);
  pm.environment.set("p3CoachId", json.data.user.id);
});'''
)

# 02
write_req(
    '02-create-athlete-session.request.yaml',
    'P3 Athlete Setup & Registration',
    2000,
    'POST',
    '{{baseUrl}}/v1/auth/register',
    headers=[{'key': 'Content-Type', 'value': 'application/json'}],
    body_json='''{
  "email": "{{p3AthleteEmail}}",
  "password": "AthletePass2026!",
  "fullName": "Olympic Athlete Sam",
  "role": "ATHLETE",
  "mode": "personal",
  "is18Plus": true,
  "birthDate": "2000-05-15T00:00:00.000Z",
  "consentGiven": true
}''',
    before_script='''const uniqueEmail = "p3_athlete_" + Date.now() + "@test.smackgym.co.uk";
pm.environment.set("p3AthleteEmail", uniqueEmail);''',
    after_script='''pm.test("Status code is 201 Created", function () {
  pm.response.to.have.status(201);
});
pm.test("Athlete session token saved", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.environment.set("p3AthleteToken", json.data.tokens.accessToken);
  pm.environment.set("p3AthleteId", json.data.user.id);
});'''
)

# 03
write_req(
    '03-athlete-configure-ramadan.request.yaml',
    'P3 Athlete Configures Religious Fasting (Ramadan)',
    3000,
    'POST',
    '{{baseUrl}}/v1/fasting/config',
    headers=[
        {'key': 'Content-Type', 'value': 'application/json'},
        {'key': 'Authorization', 'value': 'Bearer {{p3AthleteToken}}'}
    ],
    body_json='''{
  "isActive": true,
  "fastingType": "RAMADAN",
  "fajrTime": "04:30",
  "maghribTime": "18:30",
  "shiftTrainingHours": true
}''',
    after_script='''pm.test("Status code is 200 or 201", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});
pm.test("Ramadan config saved", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
});'''
)

# 04
write_req(
    '04-athlete-log-menstrual-cycle.request.yaml',
    'P3 Athlete Logs Menstrual Cycle (Luteal Phase)',
    4000,
    'POST',
    '{{baseUrl}}/v1/cycle/log',
    headers=[
        {'key': 'Content-Type', 'value': 'application/json'},
        {'key': 'Authorization', 'value': 'Bearer {{p3AthleteToken}}'}
    ],
    body_json='''{
  "cycleDay": 21,
  "overallSymptomSeverity": 4,
  "fatigueSeverity": 4,
  "notes": "Luteal phase fatigue during peak training"
}''',
    after_script='''pm.test("Status code is 200 or 201", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});
pm.test("Cycle log recorded", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
});'''
)

# 05
write_req(
    '05-coach-assign-athlete-roster.request.yaml',
    'Coach Assigns Athlete to Roster',
    5000,
    'POST',
    '{{baseUrl}}/v1/coach/roster/assign',
    headers=[
        {'key': 'Content-Type', 'value': 'application/json'},
        {'key': 'Authorization', 'value': 'Bearer {{p3CoachToken}}'}
    ],
    body_json='''{
  "athleteId": "{{p3AthleteId}}",
  "notes": "Varsity heavyweight squad athlete"
}''',
    after_script='''pm.test("Status code is 201 Created", function () {
  pm.response.to.have.status(201);
});
pm.test("Athlete assigned to coach roster", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.data.athleteId).to.eql(pm.environment.get("p3AthleteId"));
});'''
)

# 06
write_req(
    '06-coach-get-roster.request.yaml',
    'Coach Retrieves Active Roster',
    6000,
    'GET',
    '{{baseUrl}}/v1/coach/roster',
    headers=[{'key': 'Authorization', 'value': 'Bearer {{p3CoachToken}}'}],
    after_script='''pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Roster includes assigned athlete", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.count).to.be.at.least(1);
  const found = json.data.some(r => r.athleteId === pm.environment.get("p3AthleteId"));
  pm.expect(found).to.eql(true);
});'''
)

# 07
write_req(
    '07-coach-create-group.request.yaml',
    'Coach Creates Training Cohort / Group',
    7000,
    'POST',
    '{{baseUrl}}/v1/coach/groups',
    headers=[
        {'key': 'Content-Type', 'value': 'application/json'},
        {'key': 'Authorization', 'value': 'Bearer {{p3CoachToken}}'}
    ],
    body_json='''{
  "name": "Varsity Sprint Cohort",
  "description": "High performance squad for collegiate track & field",
  "athleteIds": ["{{p3AthleteId}}"]
}''',
    after_script='''pm.test("Status code is 201 Created", function () {
  pm.response.to.have.status(201);
});
pm.test("Group created and saved to environment", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.environment.set("p3GroupId", json.data._id);
});'''
)

# 08
write_req(
    '08-coach-get-groups.request.yaml',
    'Coach Retrieves Training Groups',
    8000,
    'GET',
    '{{baseUrl}}/v1/coach/groups',
    headers=[{'key': 'Authorization', 'value': 'Bearer {{p3CoachToken}}'}],
    after_script='''pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Groups list contains created cohort", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.count).to.be.at.least(1);
});'''
)

# 09
write_req(
    '09-coach-create-program.request.yaml',
    'Coach Authors Multi-Week Training Program',
    9000,
    'POST',
    '{{baseUrl}}/v1/coach/programs',
    headers=[
        {'key': 'Content-Type', 'value': 'application/json'},
        {'key': 'Authorization', 'value': 'Bearer {{p3CoachToken}}'}
    ],
    body_json='''{
  "title": "Off-Season Power Periodization",
  "description": "Comprehensive 12-week power development block",
  "weeksCount": 12,
  "difficulty": "advanced",
  "weeklySchedule": [
    {
      "dayNumber": 1,
      "focus": "Lower Body Strength & RFD",
      "exerciseIds": ["EX-SQ-01", "EX-DL-02"]
    }
  ]
}''',
    after_script='''pm.test("Status code is 201 Created", function () {
  pm.response.to.have.status(201);
});
pm.test("Program created with schedule", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.data.weeksCount).to.eql(12);
  pm.environment.set("p3ProgramId", json.data._id);
});'''
)

# 10
write_req(
    '10-coach-get-programs.request.yaml',
    'Coach Lists Authored Programs',
    10000,
    'GET',
    '{{baseUrl}}/v1/coach/programs',
    headers=[{'key': 'Authorization', 'value': 'Bearer {{p3CoachToken}}'}],
    after_script='''pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Program list contains created program", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.count).to.be.at.least(1);
});'''
)

# 11
write_req(
    '11-athlete-generate-plan.request.yaml',
    'Athlete Generates Microcycle Plan for Adaptation',
    11000,
    'POST',
    '{{baseUrl}}/v1/plans/generate',
    headers=[
        {'key': 'Content-Type', 'value': 'application/json'},
        {'key': 'Authorization', 'value': 'Bearer {{p3AthleteToken}}'}
    ],
    body_json='''{
  "targetDate": "2026-04-01T00:00:00.000Z"
}''',
    after_script='''pm.test("Status code is 201 Created", function () {
  pm.response.to.have.status(201);
});
pm.test("Plan ID saved to environment", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.environment.set("p3PlanId", json.data._id);
});'''
)

# 12
write_req(
    '12-coach-adjust-plan-audit.request.yaml',
    'Coach Adjusts Athlete Plan with Immutable Audit Trail',
    12000,
    'POST',
    '{{baseUrl}}/v1/coach/athletes/{{p3AthleteId}}/plans/{{p3PlanId}}/adjust',
    headers=[
        {'key': 'Content-Type', 'value': 'application/json'},
        {'key': 'Authorization', 'value': 'Bearer {{p3CoachToken}}'}
    ],
    body_json='''{
  "rationale": "Increasing back squat working sets from 3 to 4 based on velocity threshold",
  "proposedExercises": [
    {
      "exerciseId": "EX-0001",
      "name": "Barbell Back Squat",
      "targetSets": 4,
      "targetReps": 5,
      "targetWeightKg": 140,
      "movementPattern": "SQUAT",
      "restSeconds": 180
    },
    {
      "exerciseId": "EX-0002",
      "name": "Romanian Deadlift",
      "targetSets": 3,
      "targetReps": 8,
      "targetWeightKg": 85
    }
  ]
}''',
    after_script='''pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Plan adjusted and immutable audit log created", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.data.plan.status).to.eql("adapted");
  pm.expect(json.data.auditLog.coachId).to.eql(pm.environment.get("p3CoachId"));
  pm.expect(json.data.auditLog.athleteId).to.eql(pm.environment.get("p3AthleteId"));
});'''
)

# 13
write_req(
    '13-coach-get-plan-audit-logs.request.yaml',
    'Coach Retrieves Immutable Plan Adjustment Audit Trail',
    13000,
    'GET',
    '{{baseUrl}}/v1/coach/athletes/{{p3AthleteId}}/plans/{{p3PlanId}}/audit-logs',
    headers=[{'key': 'Authorization', 'value': 'Bearer {{p3CoachToken}}'}],
    after_script='''pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Audit logs verify coach rationale and changes", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.count).to.be.at.least(1);
  pm.expect(json.data[0].rationale).to.include("velocity threshold");
});'''
)

# 14
write_req(
    '14-gate-t13-passport-default-redacted.request.yaml',
    'Gate T13: Default Coach Passport Query Strictly Redacted (GDPR Article 9)',
    14000,
    'GET',
    '{{baseUrl}}/v1/coach/athletes/{{p3AthleteId}}/passport',
    headers=[{'key': 'Authorization', 'value': 'Bearer {{p3CoachToken}}'}],
    after_script='''pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Gate T13: Special Category Data strictly redacted without grant", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.data.gdprArticle9Protected).to.eql(true);
  const fastingFact = json.data.facts.find(f => f.key === "fasting_config");
  pm.expect(fastingFact).to.exist;
  pm.expect(fastingFact.value.redacted).to.eql(true);
  pm.expect(fastingFact.value.reason).to.eql("REDACTED_GDPR_ARTICLE_9_NO_GRANT");
  const cycleFact = json.data.facts.find(f => f.key === "menstrual_cycle_status");
  pm.expect(cycleFact).to.exist;
  pm.expect(cycleFact.value.redacted).to.eql(true);
  pm.expect(cycleFact.value.reason).to.eql("REDACTED_GDPR_ARTICLE_9_NO_GRANT");
  pm.expect(json.data.digitalTwin.fastingRedacted).to.eql(true);
  pm.expect(json.data.digitalTwin.cycleRedacted).to.eql(true);
});'''
)

# 15
write_req(
    '15-gate-t13-athlete-create-grant.request.yaml',
    'Gate T13: Athlete Grants Granular Consent to Coach',
    15000,
    'POST',
    '{{baseUrl}}/v1/grants',
    headers=[
        {'key': 'Content-Type', 'value': 'application/json'},
        {'key': 'Authorization', 'value': 'Bearer {{p3AthleteToken}}'}
    ],
    body_json='''{
  "coachId": "{{p3CoachId}}",
  "scopes": ["fasting_data", "cycle_data", "training_logs"],
  "durationDays": 30
}''',
    after_script='''pm.test("Status code is 201 Created", function () {
  pm.response.to.have.status(201);
});
pm.test("ScopedGrant created and active", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.data.isActive).to.eql(true);
  pm.environment.set("p3GrantId", json.data._id);
});'''
)

# 16
write_req(
    '16-gate-t13-passport-unredacted.request.yaml',
    'Gate T13: Coach Passport Query Unredacted with Active Grant',
    16000,
    'GET',
    '{{baseUrl}}/v1/coach/athletes/{{p3AthleteId}}/passport',
    headers=[{'key': 'Authorization', 'value': 'Bearer {{p3CoachToken}}'}],
    after_script='''pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Gate T13: Special Category Data unredacted with consent", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  const fastingFact = json.data.facts.find(f => f.key === "fasting_config");
  pm.expect(fastingFact.value.redacted).to.be.undefined;
  pm.expect(fastingFact.value.fastingType).to.eql("RAMADAN");
  const cycleFact = json.data.facts.find(f => f.key === "menstrual_cycle_status");
  pm.expect(cycleFact.value.redacted).to.be.undefined;
  pm.expect(cycleFact.value.phase).to.eql("luteal");
  pm.expect(json.data.digitalTwin.fastingRedacted).to.be.undefined;
  pm.expect(json.data.digitalTwin.isFastingRamadan).to.eql(true);
});'''
)

# 17
write_req(
    '17-gate-t13-athlete-revoke-grant.request.yaml',
    'Gate T13: Athlete Immediately Revokes Coach Grant',
    17000,
    'DELETE',
    '{{baseUrl}}/v1/grants/{{p3GrantId}}',
    headers=[{'key': 'Authorization', 'value': 'Bearer {{p3AthleteToken}}'}],
    after_script='''pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Grant marked inactive", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.data.isActive).to.eql(false);
});'''
)

# 18
write_req(
    '18-gate-t13-passport-re-redacted.request.yaml',
    'Gate T13: Coach Passport Query Re-Redacted After Grant Revocation',
    18000,
    'GET',
    '{{baseUrl}}/v1/coach/athletes/{{p3AthleteId}}/passport',
    headers=[{'key': 'Authorization', 'value': 'Bearer {{p3CoachToken}}'}],
    after_script='''pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Gate T13: Fasting data strictly re-redacted after revocation", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  const fastingFact = json.data.facts.find(f => f.key === "fasting_config");
  pm.expect(fastingFact.value.redacted).to.eql(true);
  pm.expect(fastingFact.value.reason).to.eql("REDACTED_GDPR_ARTICLE_9_NO_GRANT");
});'''
)

# 19
write_req(
    '19-create-super-admin-session.request.yaml',
    'Setup Super Admin Session for Enterprise Management',
    19000,
    'POST',
    '{{baseUrl}}/v1/auth/register',
    headers=[{'key': 'Content-Type', 'value': 'application/json'}],
    body_json='''{
  "email": "{{p3AdminEmail}}",
  "password": "AdminSuperPass2026!",
  "fullName": "Institutional Admin Director",
  "role": "SUPER_ADMIN",
  "mode": "professional",
  "is18Plus": true,
  "birthDate": "1980-01-01T00:00:00.000Z",
  "consentGiven": true
}''',
    before_script='''const uniqueEmail = "admin_" + Date.now() + "@test.smackgym.co.uk";
pm.environment.set("p3AdminEmail", uniqueEmail);''',
    after_script='''pm.test("Status code is 201 Created", function () {
  pm.response.to.have.status(201);
});
pm.test("Admin session token saved", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.data.user.role).to.eql("SUPER_ADMIN");
  pm.environment.set("p3AdminToken", json.data.tokens.accessToken);
});'''
)

# 20
write_req(
    '20-gate-t14-admin-create-institution.request.yaml',
    'Gate T14: Admin Creates Enterprise University Partner (@*.ac.uk)',
    20000,
    'POST',
    '{{baseUrl}}/v1/institutions',
    headers=[
        {'key': 'Content-Type', 'value': 'application/json'},
        {'key': 'Authorization', 'value': 'Bearer {{p3AdminToken}}'}
    ],
    body_json='''{
  "name": "King's College London Athletic Union",
  "domainPattern": "@.*\\\\.ac\\\\.uk$",
  "totalSeats": 500
}''',
    after_script='''pm.test("Status code is 201 Created", function () {
  pm.response.to.have.status(201);
});
pm.test("Gate T14: Institution initialized with 500 seats", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.data.totalSeats).to.eql(500);
  pm.expect(json.data.usedSeats).to.eql(0);
  pm.environment.set("p3InstitutionId", json.data._id);
});'''
)

# 21
write_req(
    '21-gate-t14-admin-provision-bulk.request.yaml',
    'Gate T14: Admin Provisions 500 Additional Enterprise Seats',
    21000,
    'POST',
    '{{baseUrl}}/v1/institutions/{{p3InstitutionId}}/provision-bulk',
    headers=[
        {'key': 'Content-Type', 'value': 'application/json'},
        {'key': 'Authorization', 'value': 'Bearer {{p3AdminToken}}'}
    ],
    body_json='''{
  "seatsToAdd": 500
}''',
    after_script='''pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Gate T14: Total seats expanded to 1,000", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.data.totalSeats).to.eql(1000);
  pm.expect(json.data.usedSeats).to.eql(0);
});'''
)

# 22
write_req(
    '22-gate-t14-student-domain-rejection.request.yaml',
    'Gate T14: Non-Accredited Domain Rejection (HTTP 403)',
    22000,
    'POST',
    '{{baseUrl}}/v1/institutions/claim-seat',
    headers=[{'key': 'Authorization', 'value': 'Bearer {{p3AthleteToken}}'}],
    after_script='''pm.test("Status code is 403 Forbidden", function () {
  pm.response.to.have.status(403);
});
pm.test("Gate T14: RFC 7807 code is institutional_domain_mismatch", function () {
  const json = pm.response.json();
  pm.expect(json.code).to.eql("institutional_domain_mismatch");
});'''
)

# 23
write_req(
    '23-create-student-athlete-session.request.yaml',
    'P3 Accredited University Student Athlete Registration (@kcl.ac.uk)',
    23000,
    'POST',
    '{{baseUrl}}/v1/auth/register',
    headers=[{'key': 'Content-Type', 'value': 'application/json'}],
    body_json='''{
  "email": "{{p3StudentEmail}}",
  "password": "StudentPass2026!",
  "fullName": "Varsity Rowing Captain",
  "role": "ATHLETE",
  "is18Plus": true,
  "birthDate": "2002-09-10T00:00:00.000Z",
  "consentGiven": true
}''',
    before_script='''const uniqueEmail = "rowing_captain_" + Date.now() + "@kcl.ac.uk";
pm.environment.set("p3StudentEmail", uniqueEmail);''',
    after_script='''pm.test("Status code is 201 Created", function () {
  pm.response.to.have.status(201);
});
pm.test("Student athlete token saved", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.environment.set("p3StudentToken", json.data.tokens.accessToken);
});'''
)

# 24
write_req(
    '24-gate-t14-student-claim-seat.request.yaml',
    'Gate T14: Accredited Student Successfully Claims Seat',
    24000,
    'POST',
    '{{baseUrl}}/v1/institutions/claim-seat',
    headers=[{'key': 'Authorization', 'value': 'Bearer {{p3StudentToken}}'}],
    after_script='''pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Gate T14: Seat claimed and seat count incremented", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.data.seat.status).to.eql("active");
  pm.expect(json.data.institution.usedSeats).to.be.at.least(1);
});'''
)

# 25
write_req(
    '25-gate-t14-saml-sso-callback.request.yaml',
    'Gate T14: Enterprise SAML 2.0 / OIDC SSO Assertion Login',
    25000,
    'POST',
    '{{baseUrl}}/v1/institutions/sso/saml',
    headers=[{'key': 'Content-Type', 'value': 'application/json'}],
    body_json='''{
  "email": "{{p3SsoEmail}}",
  "fullName": "Varsity Athletics Captain",
  "institutionDomain": "kcl.ac.uk",
  "samlAssertionToken": "saml-token-assertion-2026"
}''',
    before_script='''const uniqueEmail = "sso_captain_" + Date.now() + "@kcl.ac.uk";
pm.environment.set("p3SsoEmail", uniqueEmail);''',
    after_script='''pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Gate T14: SSO tokens issued and university account linked", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.data.tokens.accessToken).to.be.a("string");
  pm.expect(json.data.institution.name).to.include("King's College London");
});'''
)

# 26
write_req(
    '26-i18n-get-bengali-bundle.request.yaml',
    'Regional i18n: Retrieve Bengali Language Bundle',
    26000,
    'GET',
    '{{baseUrl}}/v1/i18n/translations?lang=bn',
    after_script='''pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Bengali localization bundle contains verified keys", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.locale).to.eql("bn");
  pm.expect(json.translations.forbidden_underage).to.include("১৮ বছর");
  pm.expect(json.translations.ramadan_suhoor_reminder).to.include("সেহরি");
});'''
)

# 27
write_req(
    '27-i18n-translate-hindi-urdu.request.yaml',
    'Regional i18n: Dynamic Key Translation (Hindi & Urdu)',
    27000,
    'POST',
    '{{baseUrl}}/v1/i18n/translate',
    headers=[{'key': 'Content-Type', 'value': 'application/json'}],
    body_json='''{
  "key": "ramadan_suhoor_reminder",
  "lang": "hi"
}''',
    after_script='''pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Hindi translation returned", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
  pm.expect(json.lang).to.eql("hi");
  pm.expect(json.translation).to.include("सुहूर");
});'''
)

# 28
write_req(
    '28-i18n-error-localized-header.request.yaml',
    'Regional i18n: Localized RFC 7807 Error via Accept-Language Header',
    28000,
    'POST',
    '{{baseUrl}}/v1/auth/register',
    headers=[
        {'key': 'Content-Type', 'value': 'application/json'},
        {'key': 'Accept-Language', 'value': 'bn-BD,bn;q=0.9,en;q=0.8'}
    ],
    body_json='''{
  "email": "underage_bn@test.smackgym.co.uk",
  "password": "Pass2026!",
  "fullName": "Bengali Minor",
  "is18Plus": false,
  "consentGiven": true
}''',
    after_script='''pm.test("Status code is 403 Forbidden", function () {
  pm.response.to.have.status(403);
});
pm.test("RFC 7807 detail localized to Bengali", function () {
  const json = pm.response.json();
  pm.expect(json.code).to.eql("forbidden_underage");
  pm.expect(json.detail).to.include("১৮ বছর");
});'''
)

print("Finished generating all 28 Phase P3 requests.")
