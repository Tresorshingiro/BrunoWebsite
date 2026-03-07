/**
 * Seed script: inserts sample books (including featured), blog posts, and events.
 * Run from backend folder: node scripts/seed.js
 * Requires: MONGO_URI in .env
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const mongoose = require('mongoose')
const Book = require('../models/Book')
const BlogPost = require('../models/BlogPost')
const Event = require('../models/Event')

const PLACEHOLDER_COVER = 'https://via.placeholder.com/300x450/2e949c/ffffff?text=My+Forgiveness+Story'

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  }

  try {
    // --- Books ---
    const existingBooks = await Book.countDocuments()
    if (existingBooks === 0) {
      await Book.insertMany([
        {
          title: 'Stories of Purpose',
          subtitle: 'Living with Intention',
          description: 'Reflections on faith, purpose, and purposeful living drawn from experience and scripture.',
          coverImage: PLACEHOLDER_COVER,
          genre: 'Christian',
          publishedDate: new Date('2023-06-01'),
          featured: false,
          price: 12000,
          inStock: true,
          availableFormats: { physical: true, digital: false },
          pages: 180,
          language: 'English',
        },
      ])
      console.log('Inserted 2 books (1 featured)')
    } else {
      console.log('Books already exist, skipping')
    }

    // --- Blog posts ---
    const existingPosts = await BlogPost.countDocuments()
    if (existingPosts === 0) {
      await BlogPost.insertMany([
        {
          title: 'Why Forgiveness Matters',
          slug: 'why-forgiveness-matters',
          content: 'Forgiveness is not about forgetting or excusing what happened. It is about freeing ourselves from the weight of bitterness and choosing peace. In my journey, I have learned that forgiveness is a gift we give first to ourselves.\n\nWhen we hold onto anger, we allow the past to control our present. Letting go does not mean the pain did not exist; it means we are no longer defined by it.',
          excerpt: 'Forgiveness is a gift we give first to ourselves. Reflections on why it matters and how it changes us.',
          category: 'Forgiveness',
          tags: ['forgiveness', 'healing', 'peace'],
          status: 'published',
          readTime: 4,
        },
        {
          title: 'Faith in Difficult Times',
          slug: 'faith-in-difficult-times',
          content: 'In the hardest moments of life, faith can feel distant. Yet it is often in those moments that we discover what we truly believe. Faith is not the absence of doubt; it is the choice to trust even when we cannot see the full picture.\n\nI have found that community, prayer, and the stories of others who have walked similar paths can help us hold onto hope.',
          excerpt: 'Reflections on holding onto faith when life is hard, and why community and story matter.',
          category: 'Faith',
          tags: ['faith', 'hope', 'community'],
          status: 'published',
          readTime: 5,
        },
        {
          title: 'Rwanda: Remembering and Healing',
          slug: 'rwanda-remembering-and-healing',
          content: 'Remembering the past is essential for healing. We do not move forward by forgetting, but by acknowledging what happened and choosing a different path. Rwanda\'s journey of reconciliation is a testament to the human capacity for both grief and grace.\n\nThis post is a brief reflection on memory, healing, and the importance of telling our stories.',
          excerpt: 'On the importance of remembering, healing, and choosing a path of reconciliation.',
          category: 'Rwanda',
          tags: ['Rwanda', 'healing', 'memory'],
          status: 'published',
          readTime: 4,
        },
      ])
      console.log('Inserted 3 blog posts')
    } else {
      console.log('Blog posts already exist, skipping')
    }

    // --- Events ---
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 14)
    const futureDate2 = new Date()
    futureDate2.setDate(futureDate2.getDate() + 30)

    const existingEvents = await Event.countDocuments()
    if (existingEvents === 0) {
      await Event.insertMany([
        {
          title: 'Book Reading: My Forgiveness Story',
          description: 'Join Bruno Iradukunda for a reading and discussion of My Forgiveness Story. Q&A and signing to follow.',
          date: futureDate,
          time: '3:00 PM',
          location: 'Kigali Public Library',
          type: 'in-person',
          registrationLink: '',
        },
        {
          title: 'Online Talk: Forgiveness and Healing',
          description: 'An online conversation on the theme of forgiveness, healing, and purposeful living. Bring your questions.',
          date: futureDate2,
          time: '7:00 PM',
          location: 'Online (link shared after registration)',
          type: 'online',
          registrationLink: 'https://example.com/register',
        },
        {
          title: 'Author Meet & Greet',
          description: 'Meet the author, get your book signed, and connect with others interested in faith and storytelling.',
          date: new Date(futureDate2.getTime() + 7 * 24 * 60 * 60 * 1000),
          time: '2:00 PM',
          location: 'Vital Readings, Kigali',
          type: 'in-person',
        },
      ])
      console.log('Inserted 3 events')
    } else {
      console.log('Events already exist, skipping')
    }

    console.log('Seed completed successfully.')
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
    process.exit(0)
  }
}

seed()
