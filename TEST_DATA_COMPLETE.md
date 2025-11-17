# Complete Test Data for PIKXORA Connect

This document contains all test request bodies for testing the complete flow from user creation to wall and project creation.

## Base URL
```
http://localhost:5000/api
```

## Headers
For authenticated requests, include:
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 1. CREATE USERS (Sign Up)

### 1.1 Create Admin User
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "admin@pikxora.com",
  "password": "Admin123!",
  "name": "Admin User",
  "role": "admin"
}
```

### 1.2 Create Studio User (Pending Approval)
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "studio1@vfx.com",
  "password": "Studio123!",
  "name": "Epic VFX Studios",
  "role": "studio"
}
```

### 1.3 Create Another Studio User
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "studio2@animation.com",
  "password": "Studio123!",
  "name": "Digital Animation Co",
  "role": "studio"
}
```

### 1.4 Create Artist User
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "artist@creative.com",
  "password": "Artist123!",
  "name": "John Artist",
  "role": "artist"
}
```

### 1.5 Create Investor User
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "investor@capital.com",
  "password": "Investor123!",
  "name": "Jane Investor",
  "role": "investor"
}
```

---

## 2. SIGN IN

### 2.1 Sign In as Admin
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "admin@pikxora.com",
  "password": "Admin123!"
}
```

**Response will include token - save this for authenticated requests**

### 2.2 Sign In as Studio
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "studio1@vfx.com",
  "password": "Studio123!"
}
```

---

## 3. UPDATE PROFILE (Studio Users)

### 3.1 Update Studio Profile - Full Data
```http
PUT /profiles/me
Authorization: Bearer <studio_token>
Content-Type: application/json

{
  "location": "Los Angeles, CA",
  "bio": "Epic VFX Studios is a leading visual effects company specializing in high-end feature films and television. We've worked on over 200 productions including blockbuster movies and award-winning series.",
  "associations": [
    "VES (Visual Effects Society)",
    "MPC",
    "Framestore",
    "ILM"
  ],
  "social_links": {
    "twitter": "https://twitter.com/epicvfx",
    "linkedin": "https://linkedin.com/company/epicvfx",
    "instagram": "https://instagram.com/epicvfx",
    "website": "https://epicvfx.com"
  },
  "brand_colors": {
    "primary": "#FF0000",
    "secondary": "#000000"
  },
  "avatar_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
}
```

### 3.2 Update Second Studio Profile
```http
PUT /profiles/me
Authorization: Bearer <studio2_token>
Content-Type: application/json

{
  "location": "London, UK",
  "bio": "Digital Animation Co creates stunning 3D animations and motion graphics for advertising, film, and digital media.",
  "associations": [
    "Bafta",
    "Animation Guild"
  ],
  "social_links": {
    "website": "https://digitalanimation.com",
    "linkedin": "https://linkedin.com/company/digitalanimation"
  },
  "brand_colors": {
    "primary": "#00FF00",
    "secondary": "#FFFFFF"
  }
}
```

---

## 4. ADMIN APPROVE STUDIOS (With Ratings)

### 4.1 Approve Studio 1 with 5-Star Rating (Global Elite)
```http
PUT /profiles/{profile_id}/verify
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "verification_status": "approved",
  "rating": 5
}
```

### 4.2 Approve Studio 2 with 4-Star Rating (Premier)
```http
PUT /profiles/{profile_id}/verify
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "verification_status": "approved",
  "rating": 4
}
```

**Note:** Replace `{profile_id}` with the actual profile ID from the pending profiles list.

---

## 5. CREATE WALLS (Studio Users - Must be Approved)

### 5.1 Create Wall - Full Featured
```http
POST /walls
Authorization: Bearer <studio1_token>
Content-Type: application/json

{
  "title": "Epic VFX Showcase",
  "description": "A comprehensive showcase of our best visual effects work spanning feature films, television, and commercials. From photorealistic creatures to massive destruction sequences.",
  "tagline": "Where Imagination Meets Reality",
  "logo_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "hero_media_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "hero_media_type": "image",
  "showreel_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "showreel_type": "embed",
  "journey_content": "Founded in 2010, Epic VFX Studios has grown from a small team of 5 artists to a global powerhouse with over 500 employees across 3 continents. Our journey has been marked by innovation, creativity, and a relentless pursuit of excellence in visual storytelling.",
  "brand_colors": {
    "primary": "#FF0000",
    "secondary": "#000000"
  },
  "social_links": {
    "twitter": "https://twitter.com/epicvfx",
    "linkedin": "https://linkedin.com/company/epicvfx",
    "instagram": "https://instagram.com/epicvfx",
    "website": "https://epicvfx.com"
  },
  "awards": [
    "Oscar for Best Visual Effects - 2023",
    "VES Award for Outstanding Compositing - 2022",
    "BAFTA for Special Visual Effects - 2021"
  ],
  "published": true
}
```

### 5.2 Create Wall - Minimal Data
```http
POST /walls
Authorization: Bearer <studio1_token>
Content-Type: application/json

{
  "title": "Quick Showcase",
  "description": "A quick look at our recent work",
  "tagline": "Fast & Furious VFX",
  "logo_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "published": false
}
```

### 5.3 Create Wall - Draft (Unpublished)
```http
POST /walls
Authorization: Bearer <studio2_token>
Content-Type: application/json

{
  "title": "Animation Portfolio",
  "description": "Our latest 3D animation projects showcasing character design, motion graphics, and visual storytelling.",
  "tagline": "Bringing Characters to Life",
  "logo_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "hero_media_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "hero_media_type": "image",
  "showreel_url": "https://vimeo.com/123456789",
  "showreel_type": "embed",
  "published": false
}
```

---

## 6. UPDATE WALL

### 6.1 Update Wall - Publish Draft
```http
PUT /walls/{wall_id}
Authorization: Bearer <studio_token>
Content-Type: application/json

{
  "published": true,
  "description": "Updated description with more details about our work"
}
```

### 6.2 Update Wall - Add More Details
```http
PUT /walls/{wall_id}
Authorization: Bearer <studio_token>
Content-Type: application/json

{
  "awards": [
    "Oscar for Best Visual Effects - 2023",
    "VES Award for Outstanding Compositing - 2022",
    "BAFTA for Special Visual Effects - 2021",
    "Emmy Award for Outstanding Visual Effects - 2020"
  ],
  "journey_content": "Updated journey: We've now worked on over 250 productions and won 15 major awards. Our team continues to push the boundaries of what's possible in visual effects."
}
```

---

## 7. CREATE PROJECTS (For a Wall)

### 7.1 Create Project - Image
```http
POST /projects
Authorization: Bearer <studio_token>
Content-Type: application/json

{
  "wall_id": "{wall_id}",
  "title": "Dragon Battle Sequence",
  "description": "A massive dragon battle sequence created for a fantasy epic. Features photorealistic creature animation, complex particle effects, and seamless integration with live-action footage.",
  "media_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "media_type": "image",
  "category": "Creature FX",
  "order_index": 1
}
```

### 7.2 Create Project - Video
```http
POST /projects
Authorization: Bearer <studio_token>
Content-Type: application/json

{
  "wall_id": "{wall_id}",
  "title": "City Destruction VFX",
  "description": "Complete city destruction sequence with realistic physics simulation, debris, smoke, and fire effects.",
  "media_url": "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAb1tZGF0AAACrgYF//+q3EXpve...",
  "media_type": "video",
  "category": "Destruction FX",
  "order_index": 2
}
```

### 7.3 Create Project - With Showreel
```http
POST /projects
Authorization: Bearer <studio_token>
Content-Type: application/json

{
  "wall_id": "{wall_id}",
  "title": "Character Animation Reel",
  "description": "Showcase of character animation work including facial animation, body mechanics, and performance capture integration.",
  "media_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "media_type": "image",
  "category": "Character Animation",
  "order_index": 3,
  "showreel_url": "https://www.youtube.com/embed/abc123",
  "showreel_type": "embed"
}
```

### 7.4 Create Project - Minimal
```http
POST /projects
Authorization: Bearer <studio_token>
Content-Type: application/json

{
  "wall_id": "{wall_id}",
  "title": "Quick Test Project",
  "description": "A simple test project",
  "order_index": 4
}
```

---

## 8. GET ENDPOINTS (For Testing)

### 8.1 Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### 8.2 Get My Profile
```http
GET /profiles/me
Authorization: Bearer <token>
```

### 8.3 Get Pending Profiles (Admin Only)
```http
GET /profiles/pending
Authorization: Bearer <admin_token>
```

### 8.4 Get All Profiles (Admin Only)
```http
GET /profiles
Authorization: Bearer <admin_token>
```

### 8.5 Get My Walls
```http
GET /walls/my
Authorization: Bearer <studio_token>
```

### 8.6 Get All Published Walls
```http
GET /walls
```

### 8.7 Get Wall by ID
```http
GET /walls/{wall_id}
```

### 8.8 Get Projects for a Wall
```http
GET /projects/wall/{wall_id}
```

### 8.9 Get Team Members for a Wall
```http
GET /team/wall/{wall_id}
```

---

## 9. CREATE TEAM MEMBERS (For a Wall)

### 9.1 Create Team Member - Full Featured
```http
POST /team
Authorization: Bearer <studio_token>
Content-Type: application/json

{
  "wall_id": "{wall_id}",
  "name": "Sarah Chen",
  "role": "VFX Supervisor",
  "bio": "Sarah has over 15 years of experience in visual effects, specializing in photorealistic creature work and complex compositing. She has led teams on multiple Oscar-winning films and is known for pushing the boundaries of what's possible in VFX.",
  "email": "sarah.chen@epicvfx.com",
  "experience_years": 15,
  "skills": [
    "Compositing",
    "Creature FX",
    "Nuke",
    "Maya",
    "Houdini",
    "Team Leadership"
  ],
  "avatar_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "social_links": {
    "linkedin": "https://linkedin.com/in/sarahchen",
    "twitter": "https://twitter.com/sarahchenvfx",
    "instagram": "https://instagram.com/sarahchen",
    "website": "https://sarahchenvfx.com",
    "portfolio": "https://sarahchen.artstation.com"
  },
  "order_index": 1
}
```

### 9.2 Create Team Member - Compositor
```http
POST /team
Authorization: Bearer <studio_token>
Content-Type: application/json

{
  "wall_id": "{wall_id}",
  "name": "Marcus Rodriguez",
  "role": "Senior Compositor",
  "bio": "Marcus specializes in photorealistic compositing and color grading. Expert in Nuke, After Effects, and Fusion.",
  "email": "marcus.r@epicvfx.com",
  "experience_years": 10,
  "skills": [
    "Nuke",
    "After Effects",
    "Color Grading",
    "Keying",
    "Tracking"
  ],
  "avatar_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "social_links": {
    "linkedin": "https://linkedin.com/in/marcusrodriguez",
    "portfolio": "https://marcusrodriguez.artstation.com"
  },
  "order_index": 2
}
```

### 9.3 Create Team Member - 3D Artist
```http
POST /team
Authorization: Bearer <studio_token>
Content-Type: application/json

{
  "wall_id": "{wall_id}",
  "name": "Alex Kim",
  "role": "3D Generalist",
  "bio": "Alex creates stunning 3D environments and assets. Proficient in Maya, Blender, and Substance Painter.",
  "experience_years": 7,
  "skills": [
    "Maya",
    "Blender",
    "Substance Painter",
    "Environment Design",
    "Texturing",
    "Lighting"
  ],
  "social_links": {
    "linkedin": "https://linkedin.com/in/alexkim",
    "website": "https://alexkim3d.com"
  },
  "order_index": 3
}
```

### 9.4 Create Team Member - Animation Lead
```http
POST /team
Authorization: Bearer <studio_token>
Content-Type: application/json

{
  "wall_id": "{wall_id}",
  "name": "Emma Thompson",
  "role": "Animation Lead",
  "bio": "Emma brings characters to life with expressive animation. Specializes in character animation, facial rigging, and motion capture integration.",
  "email": "emma.t@epicvfx.com",
  "experience_years": 12,
  "skills": [
    "Character Animation",
    "Facial Animation",
    "Motion Capture",
    "Maya",
    "MotionBuilder",
    "Rigging"
  ],
  "avatar_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "social_links": {
    "linkedin": "https://linkedin.com/in/emmathompson",
    "twitter": "https://twitter.com/emmaanimates",
    "portfolio": "https://emmathompson.artstation.com"
  },
  "order_index": 4
}
```

### 9.5 Create Team Member - Minimal Data
```http
POST /team
Authorization: Bearer <studio_token>
Content-Type: application/json

{
  "wall_id": "{wall_id}",
  "name": "John Doe",
  "role": "VFX Artist",
  "order_index": 5
}
```

### 9.6 Create Team Member - Houdini Specialist
```http
POST /team
Authorization: Bearer <studio_token>
Content-Type: application/json

{
  "wall_id": "{wall_id}",
  "name": "David Park",
  "role": "FX Technical Director",
  "bio": "David creates stunning particle simulations, fluid dynamics, and destruction effects using Houdini.",
  "experience_years": 8,
  "skills": [
    "Houdini",
    "Pyro FX",
    "Fluid Simulation",
    "Particle Systems",
    "Destruction FX",
    "Python Scripting"
  ],
  "social_links": {
    "linkedin": "https://linkedin.com/in/davidpark",
    "portfolio": "https://davidparkfx.artstation.com"
  },
  "order_index": 6
}
```

---

## 10. UPDATE TEAM MEMBER

### 10.1 Update Team Member - Add More Info
```http
PUT /team/{team_member_id}
Authorization: Bearer <studio_token>
Content-Type: application/json

{
  "bio": "Updated bio with more details about recent projects and achievements.",
  "experience_years": 16,
  "skills": [
    "Compositing",
    "Creature FX",
    "Nuke",
    "Maya",
    "Houdini",
    "Team Leadership",
    "Production Management"
  ]
}
```

### 10.2 Update Team Member - Change Role
```http
PUT /team/{team_member_id}
Authorization: Bearer <studio_token>
Content-Type: application/json

{
  "role": "Senior VFX Supervisor",
  "order_index": 0
}
```

---

## 11. DELETE TEAM MEMBER

### 11.1 Delete Team Member
```http
DELETE /team/{team_member_id}
Authorization: Bearer <studio_token>
```

---

## 12. TESTING FLOW

### Complete Testing Sequence:

1. **Create Users**
   - Create admin user
   - Create 2-3 studio users
   - Create artist user
   - Create investor user

2. **Sign In**
   - Sign in as admin (save token)
   - Sign in as studio1 (save token)
   - Sign in as studio2 (save token)

3. **Update Profiles**
   - Update studio1 profile with full data
   - Update studio2 profile with full data

4. **Admin Actions**
   - Get pending profiles
   - Approve studio1 with 5-star rating
   - Approve studio2 with 4-star rating
   - Get all profiles to verify ratings

5. **Create Walls**
   - Studio1 creates a published wall with full data
   - Studio1 creates a draft wall
   - Studio2 creates a published wall

6. **Create Projects**
   - Add multiple projects to each wall
   - Mix of images, videos, and showreels

7. **Create Team Members**
   - Add team members to each wall
   - Include various roles (VFX Supervisor, Compositor, 3D Artist, etc.)
   - Add full profiles with skills, experience, and social links

8. **View Results**
   - View published walls (public)
   - View my walls (authenticated)
   - View wall details
   - View projects for each wall
   - View team members for each wall

---

## 13. SAMPLE BASE64 IMAGE (1x1 Red Pixel)

For testing purposes, use this minimal base64 image:
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==
```

**Note:** In production, replace with actual base64-encoded images/videos. The server validates image sizes (max 50MB for images).

---

## 14. RATING SYSTEM

When approving studios, use these ratings:
- **5 stars**: Global Elite Studio
- **4 stars**: Premier Studio
- **3 stars**: Verified Studio
- **2 stars**: Approved Studio
- **1 star**: Entry Level Studio

---

## 15. QUICK TEST SCRIPT

### Using cURL:

```bash
# 1. Create Admin
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pikxora.com",
    "password": "Admin123!",
    "name": "Admin User",
    "role": "admin"
  }'

# 2. Create Studio
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "studio1@vfx.com",
    "password": "Studio123!",
    "name": "Epic VFX Studios",
    "role": "studio"
  }'

# 3. Sign In as Admin (save token)
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pikxora.com",
    "password": "Admin123!"
  }'

# 4. Get Pending Profiles (use admin token)
curl -X GET http://localhost:5000/api/profiles/pending \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 5. Approve Studio (use admin token and profile_id from step 4)
curl -X PUT http://localhost:5000/api/profiles/PROFILE_ID/verify \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verification_status": "approved",
    "rating": 5
  }'

# 6. Sign In as Studio (save token)
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "studio1@vfx.com",
    "password": "Studio123!"
  }'

# 7. Create Wall (use studio token)
curl -X POST http://localhost:5000/api/walls \
  -H "Authorization: Bearer YOUR_STUDIO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Epic VFX Showcase",
    "description": "Our best work",
    "tagline": "Where Imagination Meets Reality",
    "published": true
  }'

# 8. Create Team Member (use studio token and wall_id from step 7)
curl -X POST http://localhost:5000/api/team \
  -H "Authorization: Bearer YOUR_STUDIO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "wall_id": "YOUR_WALL_ID",
    "name": "Sarah Chen",
    "role": "VFX Supervisor",
    "bio": "15 years of experience in visual effects",
    "email": "sarah.chen@epicvfx.com",
    "experience_years": 15,
    "skills": ["Compositing", "Creature FX", "Nuke", "Maya"],
    "order_index": 1
  }'
```

---

## Notes:

1. **Replace Placeholders:**
   - `{wall_id}` - Use actual wall ID from create response
   - `{profile_id}` - Use actual profile ID from pending profiles
   - `<token>` - Use actual JWT token from signin response

2. **Image/Video Data:**
   - For production, use actual base64-encoded media
   - Server validates image sizes (max 50MB)
   - Videos can be base64 or embed URLs

3. **Authentication:**
   - All protected routes require `Authorization: Bearer <token>` header
   - Tokens expire after 30 days

4. **Roles:**
   - `admin`: Can approve/reject studios, view all profiles
   - `studio`: Can create walls and projects (after approval)
   - `artist`: Can view content
   - `investor`: Can view content

5. **Verification Status:**
   - Studios start as `pending`
   - Must be `approved` by admin to create walls
   - Admin assigns rating (1-5) during approval

