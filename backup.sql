--
-- PostgreSQL database dump
--

\restrict e1NEORyFYdtSZgv90nRmIsXKAM2iJztN8rZBIZZFDaG5gC5LruZCSmEac2P290s

-- Dumped from database version 16.12 (7bcf9ab)
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _system; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA _system;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: replit_database_migrations_v1; Type: TABLE; Schema: _system; Owner: -
--

CREATE TABLE _system.replit_database_migrations_v1 (
    id bigint NOT NULL,
    build_id text NOT NULL,
    deployment_id text NOT NULL,
    statement_count bigint NOT NULL,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE; Schema: _system; Owner: -
--

CREATE SEQUENCE _system.replit_database_migrations_v1_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE OWNED BY; Schema: _system; Owner: -
--

ALTER SEQUENCE _system.replit_database_migrations_v1_id_seq OWNED BY _system.replit_database_migrations_v1.id;


--
-- Name: entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entries (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    prompt_id integer,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    word_count integer NOT NULL,
    mood character varying(20)
);


--
-- Name: entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.entries_id_seq OWNED BY public.entries.id;


--
-- Name: feature_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feature_votes (
    id integer NOT NULL,
    feature_id integer NOT NULL,
    visitor_id text NOT NULL,
    vote_type text NOT NULL
);


--
-- Name: feature_votes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.feature_votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: feature_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.feature_votes_id_seq OWNED BY public.feature_votes.id;


--
-- Name: features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.features (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    upvotes integer DEFAULT 0 NOT NULL,
    downvotes integer DEFAULT 0 NOT NULL,
    is_user_suggested boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    suggested_by_user_id text
);


--
-- Name: features_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.features_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: features_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.features_id_seq OWNED BY public.features.id;


--
-- Name: magic_link_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.magic_link_tokens (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    token character varying NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: prompts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prompts (
    id integer NOT NULL,
    content text NOT NULL,
    category text NOT NULL
);


--
-- Name: prompts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.prompts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prompts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.prompts_id_seq OWNED BY public.prompts.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    username character varying NOT NULL,
    password character varying,
    reminder_enabled boolean DEFAULT false,
    reminder_time character varying DEFAULT '09:00'::character varying,
    reminder_timezone character varying DEFAULT 'America/New_York'::character varying,
    is_email_verified boolean DEFAULT false,
    email_verification_token character varying,
    email_verification_expires timestamp without time zone,
    welcome_email_sent_at timestamp without time zone,
    daily_word_goal integer,
    weekly_summary_enabled boolean DEFAULT true,
    last_weekly_summary_at timestamp without time zone,
    last_reminder_sent_at timestamp without time zone
);


--
-- Name: replit_database_migrations_v1 id; Type: DEFAULT; Schema: _system; Owner: -
--

ALTER TABLE ONLY _system.replit_database_migrations_v1 ALTER COLUMN id SET DEFAULT nextval('_system.replit_database_migrations_v1_id_seq'::regclass);


--
-- Name: entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entries ALTER COLUMN id SET DEFAULT nextval('public.entries_id_seq'::regclass);


--
-- Name: feature_votes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_votes ALTER COLUMN id SET DEFAULT nextval('public.feature_votes_id_seq'::regclass);


--
-- Name: features id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.features ALTER COLUMN id SET DEFAULT nextval('public.features_id_seq'::regclass);


--
-- Name: prompts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prompts ALTER COLUMN id SET DEFAULT nextval('public.prompts_id_seq'::regclass);


--
-- Data for Name: replit_database_migrations_v1; Type: TABLE DATA; Schema: _system; Owner: -
--

COPY _system.replit_database_migrations_v1 (id, build_id, deployment_id, statement_count, applied_at) FROM stdin;
1	d032e0db-13ad-4a3f-bb6e-6140da994979	5dd22c01-bb1d-4895-8869-9f99581d48af	4	2026-01-11 18:44:28.764636+00
2	a80d09d6-4965-45b1-9d2c-5e458b8fda35	5dd22c01-bb1d-4895-8869-9f99581d48af	1	2026-01-14 21:35:35.303708+00
3	bf1943b7-6da5-4f47-bf82-b32e6c9a8fa9	5dd22c01-bb1d-4895-8869-9f99581d48af	6	2026-02-01 21:23:22.94391+00
4	04359c85-7573-439e-bbe6-24c07ff6c00c	5dd22c01-bb1d-4895-8869-9f99581d48af	1	2026-02-01 22:36:28.135933+00
5	25577b38-cd4e-404c-a284-22f6b1f05974	5dd22c01-bb1d-4895-8869-9f99581d48af	1	2026-02-02 10:09:08.30837+00
6	ae5f04cb-884a-41a9-8832-ad63f7651626	5dd22c01-bb1d-4895-8869-9f99581d48af	2	2026-02-12 14:42:26.548879+00
\.


--
-- Data for Name: entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entries (id, user_id, prompt_id, content, created_at, word_count, mood) FROM stdin;
19	76a1ed71-3657-4da1-91be-2c2cca6988dc	64	My body is tired. She is screaming at me to remember to take it slow. What's the rush? She asks. Not a scream, not a reprimantation, but with an urgency of someone who is begging me to see the bigger picture here. \n\nThe stuff will get done. The things will be in place. You'll get to where you need to go. What's the point in running your mind into the abyss with nothing to grasp and hold onto but a net of panic? \n\nShe reminds me that we are a team. I cannot work without her, so it is best to take care of her. She is the vehicle in which my soul drives. And I, as the caretaker, needs to remember that we cannot cease to exist without each other. \n\nSo I will listen. I will trust in the timing of my life and do what I can with what I can. There's no reason to drive us both into the ground when the luxury in life is our health. It's not fair to myself or to the body that has given me breathe, strength, mobility, and luck have me, the ability to create life. \n\nShe is right. She is good. She is the best. I will listen. 	2026-01-21 20:25:30.171484	209	\N
20	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	24	For a long time, I didn' really believe in stress at work... then I believed that I ENJOYED being stressed at work.  Both of those states suited the type of work I was doing. \n\nNow, as I get a bit older and maybe a bit wiser I think that adapt to stress much better than I did in the past. If a situation requires a higher level of stress, I find myself rising to it - but if the moment needs me to be calm, I can bring myself 'down' to that level. \n\nIts the incongruence that makes me unhappy - when you are showing signs of stress in place that doesn't need it or warrant it - then thats going feel weird. \n\nBut if I find myself in an appropriate state of stress about something, I deal with it by breathing, trying to relax and trying to ensure that I make good decisions. \n\nSometimes I just give myself a good talking to!	2026-01-22 10:14:26.225512	163	\N
21	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	62	Sitting at my desk at home... five things:\n\n1. Moleskine notebook/planner - an analog place to capture thoughts, ideas and reminders.  Always on, never out of power or signal. \n2. Coke Zero - one or two on a weekend day maximum, getting over it at work which is a positive.\n3. Phone - too much, too frequent, too annoying. Need to get better at leaving it alone and ignoring the vibrate. \n4. Webcam - spent a lot of time looking at this during the week, thank goodness the calibration week is over. \n5. Various papers - things to be done, things to be adminned.  Getting there!	2026-01-24 12:13:32.744105	106	\N
38	176a4e4e-4a31-447b-88ae-5c631dedd892	51	Understanding that my greatest enemy was my lack of confidence. \n\nHaving had no sense of worth for so long effects all aspects of who are, or can become. \n\nIt was only as my confidenace grew I realised started to realise that it had effected me so badly, and though this acknowledgement it became a challange for me to over come.  	2026-02-01 05:02:33.969687	60	\N
40	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	14	fdlsmf fldsm mfsldkm lsmd lfmsdlk fmsl mfsldkfm slkm fslkm fslk mfsl kmlfsm flsd mfls mkfsdl mfsl km	2026-02-01 21:34:47.089803	17	grateful
41	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	1	I did a yoga exercise on my own this morning, and although I couldn;t complete the whole thing - I did it without being pushed - I enjoyed the time doing it, and I'm happy that I self initiated. 	2026-02-02 09:55:29.410783	39	happy
42	e5e29137-0715-4fb5-b797-709701726e60	2	At this exact moment I am glad that I am about to finish work and go and make dinner then I will have limited things to do this evening before going to sleep.\nI am so luck to work from home and not really have that much work to do.  \nI have spent today writing my review and that is now complete so I can tick that off the list of things to do.  \nToday I am very glad of Michael and how much he cares for me even when he feels tired and stressed himself.  \nI have a warm home, money in the bank and the food shopping delivery means I have a full fridge and haven't had to go out to the shops to get it.  \nNoah has joined his science intervention too which is really positive.  	2026-02-02 17:05:00.762834	139	\N
43	176a4e4e-4a31-447b-88ae-5c631dedd892	9	For the last 17 years I have had the chance to travel all over the world for work. \n\nThough this is can be taxing, I am always aware this is a opportunity which most people do not have.\n\nIt is the chance to sample other cultures, people and situations, and it alway reminds me that we all ultimatly want the same thing, to happy and secure. 	2026-02-03 09:49:18.207533	66	calm
44	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	3	I usually answer this with 'my Dad' - but I think more recently, my wife. As a proofreader and cheerleader she makes my work life better and helps me get my ideas onto paper.  Always unflinching in her support. \n\nThanks Mrs. 	2026-02-03 09:58:28.746812	41	grateful
45	e5e29137-0715-4fb5-b797-709701726e60	75	I feel so drained right now.  What would make me feel more settled or full?  I would be holding a hot cup of tea and someone would be stroking my hair.  \nI don't want to go out to the bell ringing right now - I constantly struggle with what is about lack of discipline and what is about lack of capacity.\nI honeslty beleive that my reluctance tonight is about lack of capacity and I am not convinced the group dynamic will help me feel better this evening.  Everything aches and I am not sure this is a good place to be at while trying to learn something new.\nWhat would self compassion in this moment look like - accepting I don't have the energy and I can try again next week.  \nJust showing up sometimes is too much	2026-02-03 17:39:04.908606	139	\N
46	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	1	I woke up early this morning, and S was stirring... i scooched over and had a 10 minute cuddle - in the dark, in the warm.  It was a great way to start the day. 	2026-02-04 09:56:45.556269	35	happy
47	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	14	I miss my Dad - I know that he is still alive, but he is getting older and travel both ways is difficult.  I'd like to spend more time hanging out with him and understanding what is going in his life, and in his head. 	2026-02-05 10:06:16.492079	45	neutral
48	176a4e4e-4a31-447b-88ae-5c631dedd892	6	I would simply tell him to try to understand his self worth, that he has qualities which people will like, he is not the losser he thinks he is.\n\nAnd to find new friends, those people you are hanging out with will not help you grow. They are only good for escapism and there is so much more to life then drinking, drugs and women. \n\nYou have brains kid, just because you have issues writing and expressing you thoughts doesn't make you stupid. You will learn how to, trust me. Its work but you will.\n\nAnd a final note, understand what makes you happy, not what people or things, but truly what makes you happy.\n	2026-02-06 04:56:45.663356	115	anxious
49	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	54	I'm pretty good at thinking on my feet and working quickly when required... but I'm also thankful that I am developing the skill of slowing down and thinking. 	2026-02-06 10:49:14.64257	28	calm
6	3bb044a7-cc42-432e-bea4-c73c28c47c78	2	I bridge between creative and technical thinking. I often approach a task with a structure or process, and am always keen to understand how my work fits into a bigger picture. I find detail fascinating and reassuring, not boring. I can create structure from ambiguity and collapse uncertainty. Creatively, I dig down to the root of a problem or scenario, something rooted in human behaviour, decision making or experiences. This makes sure a solution or intervention has the intended effect. I am firecely user centred. I will bring a strong sense of ethics and responsibility to a team. I can be fast. Things like complex prototyping or mapping don't scare me. I will go the extra mile when needed. I will also encourage a sustainable work/life balance in a team. I know what professional, compassionate, respectful management looks like. Teams that push too hard will eventually collapse. I document things. My work doesn't belong to me - it belongs to the organisation, and will do long after I've moved on. I ask "why" a lot. I will challenge assumptions and opinions. But I will also bring 10+ years of design experience and gut instinct. I won't waste time testing low-risk things. I'll hone in on finding out what will be most valuable.	2026-01-14 12:08:55.996026	212	\N
7	3bb044a7-cc42-432e-bea4-c73c28c47c78	26	I make mistakes when I'm tired or not feeling confident. I  tend to make easy decisions to people-please and then they come back to haunt me. Not pushing to present my own work has led to a signal-loss between leadership and work to be done. Not pushing back on the misuse of the emergency banner card component has led to a messy, useless thing going into the app on my approval. It's hard to balance my low status and influence with maintaining a high level of quality and pride in my work. Balancing "not everything is yours to fix" with "but if you take your foot off the gas, things will be your fault". Perhaps that's just an internal voice. No one at GDS has ever pointed a finger or been upset with my output. But when things go wrong and I know it's because I was tired, or I let something go, or I didn't challenge something I thought was wrong - I label it as my fault. Maybe I just need an in-the-moment reminder to keep going and keep standards high in these situations - but that might be trying to drain from a tank that's empty. Pushing harder might do more damage than good. More to think about, especially whilst Im trying to understand and be kinder to myself in 2026.	2026-01-14 12:13:44.111442	224	\N
9	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	6	I'd love a chance to talk to my younger self. I'd tell younger Matt that everything is going to be OK. You'll meet the girl of your dreams, you will stop worrying about money, you will find a job that you love and you'll find calm most of the time. \n\nYou will have some adventures and you'll have good memories to sit back and enjoy. \n\nId advise my younger self that life isn't always about choosing between things, you can have both things some times. \n\nThe only thing I'd get my younger self to change is my relationship to health - maybe build some more exercise into your life as a habit - conquer the sweet tooth earlier and try and keep the weight off before it becomes an issue.  	2026-01-15 07:13:18.991409	130	\N
10	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	27	I don't full believe in 'balance' between work and life. Work is a PART of my life, and I make sure it has enough time in order to feel fulfilled at work. \n\nI'm lucky in the way my calendar shapes, and that I don't have too much travel any more - my mornings are slow, and honestly I would prefer an earlier start when my energy is higher - my weekday calendar gets busier in the afternoon and I am gradually learning how to manage my energy ahead of the afternoon/evening.\n\nOn the whole, I am satisfied with the blend of work and life and I think I have time to fulfill all the aspects of my life. As I get older, I am certain that the blend will need to change and that I have the tools and space to do that. \n\nThe only thing that could change that approach is a new job - and I'm prepared to tackle whatever comes my way. 	2026-01-16 09:44:03.826611	165	\N
11	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	7	I'd like to build a habit that involves move gentle exercise. Either tai-Chi or Yoga are ideas that I am contemplating, but I need to find the right way to learn these... that will help me develop the habit. 	2026-01-17 10:08:36.124872	39	\N
12	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	47	I think my coach, who I saw during my own coaching course made a huge difference. We talked about the difference between retiring and stopping. She helped me understand that I had an opportunity to 'curate' my life in such a way that I could continue to enjoy thethings that interest me into a stage of life where I slow down. \n\nSince those sessions, I have been far more relaxed about my life time line. 	2026-01-18 09:09:06.671662	75	\N
13	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	46	1. Grateful for a restful weekend ahead of a busy week - lots to do this week and an important one for how I show up in my job. \n\n2. Grateful for the trust shown in me at work to be the person that guides people through the performance process, and the thanks I got on Friday for an important step - more of the same required this week. \n\n3. Grateful that S seems better today than yesterday, hoping her cold goes away and she feels better ahead of her trip to Spain on Saturday. 	2026-01-19 10:31:07.255076	95	\N
14	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	13	Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.	2026-01-20 10:55:02.257897	69	\N
16	e5e29137-0715-4fb5-b797-709701726e60	1	I wasn't sure if I wanted to run with people again.  My stomach played up and I felt nervous but I made it out the door.  The morning was dark and cold but I was okay without a coat.  I met Abi and Mandy just outside my house so my timing was just fine.  It felt completely natural to see Mandy again for a run.  We walked up past the ambulance station so that we had a good 1km run downhill before the mud kicked in.  I thought that I would be much slower than the others, I expected to struggle and yet it wasn't like that at all.  I set off possibly a little too fast but I was able to keep the pace up all the way until the end of the 1km.  I went as fast as I have ever gone really and it felt exhilerating.\nI could have wooped for joy at the end although I didn't have a lot of breath left!	2026-01-20 11:29:38.161579	167	\N
17	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	48	Working on Casa with Sandrine has been joyful, looking at pictures, buidling the website and getting all the admin details together has made me realise that this is a project that will help us in the future, maybe make us a bit of money and provide for our future. \n\nNow - I'm redoubled on my efforts to think about what comes next.  Do we go for more in Spain, with a chance to double our income there - or think about France as our retirement place. \n\nLots of next steps. 	2026-01-21 11:54:47.147657	90	\N
39	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	7	Today I am grateful that Sandrine is back after her trip to Spain... having her back in the house is lovely, for conversation and routine and the safety of having her here. 	2026-02-01 09:59:36.302353	32	\N
22	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	10	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse interdum eu ex ac laoreet. Duis non tincidunt dui, a ultrices neque. Phasellus consequat augue eros, sit amet eleifend nunc laoreet et. Ut lacinia lectus nunc, ut tempor nunc pharetra sed. Curabitur consectetur neque vel tellus eleifend bibendum. Proin faucibus porta massa, non tristique augue accumsan venenatis. Aliquam sagittis egestas imperdiet. Nam et augue congue, feugiat dui in, fermentum massa. Vivamus non augue diam. Nam nisi arcu, euismod quis libero vestibulum, vulputate scelerisque risus. Cras malesuada mollis porta. Suspendisse potenti. Proin vulputate lectus elit, a pellentesque sapien volutpat a. Donec maximus sollicitudin urna sagittis semper. Fusce ac sapien condimentum, luctus libero vitae, dignissim magna. Duis diam dui, sagittis ac ultricies eget, euismod quis dolor.\n\nDuis sit amet venenatis erat. Nulla hendrerit mollis mauris ac blandit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed lobortis felis massa, in scelerisque odio dapibus non. Maecenas pulvinar scelerisque dui sed iaculis. Maecenas sagittis mollis nisl ut accumsan. In luctus velit et felis vehicula, ut molestie massa sodales. Nunc eu tortor lacinia, rutrum nisl vulputate, sagittis nisl.\n\nNam facilisis dignissim quam, ac luctus nunc commodo vitae. Fusce eget ante eget ligula faucibus tristique eget in elit. Donec ac ultrices diam. Phasellus eu dapibus lorem. Aenean nibh nulla, fermentum vitae sodales a, ullamcorper in diam. Ut aliquet orci vel consequat interdum. Integer ultricies est et ullamcorper iaculis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In fringilla quam non mi aliquet faucibus eget et lectus. Morbi et nulla ac metus gravida gravida vitae sed metus. Sed sodales semper tellus, a euismod magna facilisis sed. Donec quis molestie libero, ac fringilla mi. Vestibulum et dapibus est.\n\nAliquam ultrices sodales nibh vel luctus. Duis vehicula ac dui vestibulum elementum. Ut iaculis non nisl eget hendrerit. Maecenas aliquam faucibus mauris a euismod. Nulla a mauris risus. Donec eget porta ipsum. Integer nunc mauris, pellentesque a libero eget, ullamcorper bibendum felis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nullam in auctor augue. Nam venenatis aliquam metus ut tincidunt.\n\nDuis vehicula nibh leo, non faucibus urna accumsan sed. Donec auctor diam quis ante auctor placerat. Maecenas at arcu eget enim finibus sagittis vel eu tellus. Aliquam sagittis aliquam vestibulum. Phasellus porta ultricies sem, non pretium eros pretium nec. Aliquam et ligula vel ligula scelerisque convallis. Fusce condimentum at purus nec aliquam.	2026-01-24 15:42:10.280363	401	\N
26	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	69	I'm not sure what I need to let go of - I mean, my life feels quite free. My only real responsibility is to work and making sure that I build my income and my savings. \n\nThe rest of my life feels pretty free. \n\nI suppose, if I drill into the question - the only thing I'd like to let go of, is some possessions... we have a lot of stuff, some of it is comforting (vinyl, books etc) - but some feels like clutter and I'd like to be better at clearing that down.   Maybe time for a spring purge. 	2026-01-25 09:02:40.1074	101	\N
27	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	3	I think that my morning routine is will optimised now.  A short read of the headlines in bed with coffee. Followed by a shower, and then some time on my phone (wordle etc)\n\nIn a quiet house, I would try and read for 30 mins before leaving for work - with another coffee.  I take breakfast at work in the weekdays and then a final coffee before starting at my desk. \n\nIn the winter - I sometimes have an extra coffee on my train ride to work. During my train ride, I am trying to watch my phone less and see what is happening in the world - in the spring and summer this is easier, and often depends on what I am listening to. \n\n	2026-01-26 11:17:04.084471	125	\N
28	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	4	I'd like to conquer my pretty obvious imposter syndrome when it comes to promoting my newsletter on LinkedIn.\n\nI know that Linked In would be a strong platform for me to promote what I do, but I still cannot get past the fact that colleagues might see my posts and make judgements. 	2026-01-27 10:15:25.430788	52	\N
29	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	32	The rain, the sea, the clouds - peoples moods in wet and dreary January. \n\nPretty fitting today. \n	2026-01-27 10:49:28.578521	17	\N
30	e5e29137-0715-4fb5-b797-709701726e60	8	My favourite place isn't a place it si a feeling.  When I am with Michael and Noah and we have travelled somewhere new and we have the whole holiday stretched ahead of us.  I love the feeling of exploring a new place and finding the gems about it.  \nThis all isn't true my faviourite place is curled up in a chair with a book and my cat and my dog, food in the slow cooker and a hike under my belt.  \nI always want to go back to the top of the Malvern Hills and I have all of this in my power.  What stops me from feeling that freedom?\nI want to explore the hills with a book and a flask of hot tea in my bag, to sit down and read my book and then carry on walking with no deadlines to fulfil.\nAnd I want to sit and knit a jumper with an audiobook taking me somewhere wonderful.\nNone of these are about place they are about accomplishment and family and love.	2026-01-27 17:21:20.845364	175	\N
31	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	59	Almost everything thing - but most of all the scale of what nature 'does' - from mountain ranges, fjords and deserts - down to the smallest things.   \n\nI'm not convinced that all of this is entirely coincidental. 	2026-01-28 13:17:59.044919	37	\N
32	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	58	I think that learning that not eveerything is about me has been a great lesson to learn - I still need to remember it occasionally and tune in to other peoples needs. \n\nMy coaching course was a great way to learn to focus more on others and less on myself. I'm still proud that I did that, and I'd like to ensure I am fully engaging that muscle regularly. 	2026-01-29 10:03:30.573003	69	\N
33	e5e29137-0715-4fb5-b797-709701726e60	6	Oh sweet girl.  Hold on it does get better.  \nDon't misunderstand it actually has some pretty awful moments but it won't always feel this hard.\nI cannot wait for you to stop seeking other people's validation.  I completely understand why you are doing it, it feels quite often that you must be broken or unlovable but one day you will find your people.  They won't always show up how you want them to and to be fair neither will you. \nStop thinking its cool to not care about being fit and healthy.  You want to live a long life because there is so much wonder and joy out there.  Get yourself out into nature, remember how much you love reading and start trying to make things as much as you can and you will find the most amazing level of peace.  	2026-01-29 15:19:35.417623	141	\N
34	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	7	I've just started yoga lessons - 1x week is good, but I think there could be benefit to doing this more than once per week.\n\nThen. I'd really like to try and build a better habit around movement/exercise - something every day, or at least 3/4x per week. \n\nI have the time, I just need to build the habit. 	2026-01-30 10:15:31.249168	59	\N
35	e5e29137-0715-4fb5-b797-709701726e60	15	I want to know that I have tried to do my best - that I have worked hard but the outcome doesn't have to be perfect.  I want to have enough money that I don't have to think about it too much and enough free time to be able to spend with the people I love doing the things I enjoy. \nSuccess doesn't look like big cars to me but time and space.  \nIf I could close my eyes and be successful I would be running my own business that was profitable enough it wasn't driving me into the ground.\nI have success now because I am happy with what I have and don't lust after a bigger house/ a bigger car more gadgets. \nSuccess means being able to spend time in the community building a better future but to do that I do need money to support myself.  	2026-01-30 17:34:30.640795	149	\N
36	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	64	Interesting prompt.   I did yoga yesterday and I have a few aches this morning - but weirdly I am keen to do something else.  I will do some weights and stretches tomorrow.  	2026-01-31 09:55:40.617761	32	\N
37	176a4e4e-4a31-447b-88ae-5c631dedd892	37	The sound of rain makes me feel alive, now I am not talking about a drizzle. I mean when the heavens open up and you can smell ozone in the air.\n\nThere is no noise except the rain, it becomes the sole thing to foucus on. It feels as if like everything in site is being cleansed by the rain, and that feeling of renwal is what breaths life into me once more. 	2026-01-31 13:56:44.029338	73	\N
50	e5e29137-0715-4fb5-b797-709701726e60	16	I am most proud of qualifying as a social worker and working in that field for several years.  Specifically the work that I did with Pause in Worcestershire was the most fulfilling and life altering. \nIt saddens me that there is no element of that in my professional life today.\nI took a lot of personal identity from being a person who did things that others found hard, I was able to sit in the discomfort and the disquiet and go to the hard and vulnerable places. \nI am not convinced I was that good at it if I am honest.  I think I had some skills but I feel like I was just hard working and single minded and am not convinced I could do that again now.\nI wish I could find a role that gave me that same fulfillment each day but paid the bills and had less stress.  \nStill hoping writing and craft career will be the way forward.  	2026-02-06 17:07:58.206566	163	\N
51	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	6	Don't lose your streak on SWN!	2026-02-07 22:10:03.91644	6	happy
52	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	8	I love being in Spain where I feel warm and relaxed most of the time. \n\nBut I also love being anywhere with Sandrine.  Safe and cared for. 	2026-02-08 08:20:16.378278	27	calm
53	176a4e4e-4a31-447b-88ae-5c631dedd892	62	I have a can of coconut water, it is in a dark lime green colour with white writing on it. \n\nThere is my PC, it is a desk top unit with a glass side to show you the inside of the machine, the RAM and cooling fans have in built lights which are set to cycle through all the colours. \n\nThere is a white USB C phone charger with two pins. It has Samsung writen on it. \n\nAnd a small black UBS dongle for a mouse. 	2026-02-08 11:41:27.470177	86	calm
54	e1460926-3474-4f41-9243-8f5113f4ea09	3	I would live somewhere where it's normal but could potenial have some supernatural force in it. I think I envision myself in the Marvel universe (Unfortunatley). Though cliche, The marvel universe outside of the craziness that happens, is pretty much the real world. So It'd be an action movie. My characher would be the ordinary guy who gets the sudden powers or abilities to save the world. \n\nOn another note, my life might also be a comedy. Sometimes when I'm out and about, situations just don't feel real. Like the jokes were taken right out of a script. The timing of it all makes it a comedy.	2026-02-08 22:19:42.242648	107	calm
55	e1460926-3474-4f41-9243-8f5113f4ea09	69	An action oriented change in my feelings like sharing things with others or actually feeling happy when someone wins that isn't me. I would let go of the need to be on top of everything and rather let life take it's course while only worrying about how I am towards other people. I would also let my horrible internal thoughts leave my mind when something bad happens to me or I second guess when someone gives me an odd look. My mind would be at peace. Free from the opinons of this world and moving at the pace that I'd want it at nothing else. This is what I want.	2026-02-08 22:23:47.293972	110	calm
56	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	53	Always - my wife... 100% support when it is needed most. 	2026-02-09 09:04:41.952295	11	calm
57	176a4e4e-4a31-447b-88ae-5c631dedd892	48	Hanging with my wife, small moments with her bring me peace and security. 	2026-02-09 13:55:34.656246	13	\N
58	e5e29137-0715-4fb5-b797-709701726e60	55	Everything felt like chaos.  My brain and nerves fizzed with the pressure of making sure that I was making all the right decisions.  Each decision felt weighted with the future, the present and the past.  I felt lost.\nNoah and I had left our home in Somerset.  I could not carry on in the relationship with Darren and he had made it impossible for me to stay in the home because he would not let go.  \nWe had stayed with my sister for two weeks but after that she needed us to go and present as homeless.  So we did just that and thankfully the housing officer I spoke with could recognise that the relationship was abusive and so I was offered a refuge space. \nWe got there with all our stuff and not really knowing where to go or what to do and it all felt overwhelming and exhausting.\nAnd within that first week we walked to the shop that was just round the corner and Noah put his warm, soft hand in mine and all felt okay.  He was the reason to do everything else.  	2026-02-09 17:02:20.509856	187	\N
59	176a4e4e-4a31-447b-88ae-5c631dedd892	8	My favourite place in the world is a privately owned cinema in Londons Leicester Square.\n\nIt has an old school cinema style facade where they list the movies, usually accompanied by a quote from them.\n\nWhen you enter there is a small lobby woth space for 10 people with a counter to buy tickets and connections from. It has dark wood stained panels and various movie posters.\n\nTo left there is a door going up to the smaller screen, to the right a stair case heading down to a bar and the main screen.	2026-02-10 06:35:26.247786	94	sad
60	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	28	I think I'm doing my dream job - I love working with people at the edge of technology. 	2026-02-10 09:55:31.402135	18	calm
61	81c6d85b-7275-4705-b3c9-d749344965ff	8	My favorite place in the world is in the mountains on a porch or sitting by the fire with a hot cup of coffee in my hands, bundled up sitting next to my best friend Alyson. The air is crispy and so clean it almost stings the nose. The smell of pine perfumes the air with occassional wafts of the coffee and cinnamon in my hand, the smell of burning wood in the mix. The fire is crackling and roaring, captivating our stares. The sounds of nature waking up and the sun peaking over the mountains. Laughter inevitably happens. 	2026-02-11 15:17:10.77336	99	neutral
62	81c6d85b-7275-4705-b3c9-d749344965ff	14	I miss my body and confidence that I worked really hard for last year. It was the first time in my life I knew what it felt like to have abs! What it felt like to have confidence and feel good in my clothes and swim suits. I didn't say no to plans because of my weight, in fact I was more active than I have ever been, more social than I have ever been. It brought me joy feeling good in my body. I want to get back there and I will try to get back there. I am grateful for what my body can do AND it is frustrating when it doesn't do the things I want. That is what makes this so hard being grateful and frustrated at the same time. 	2026-02-11 15:28:25.926215	134	neutral
63	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	15	This is it.  Where I am now feels successful. 	2026-02-12 09:00:55.478177	9	happy
64	e1460926-3474-4f41-9243-8f5113f4ea09	10	Concentration has been hard ever since graduating college. I got a little bit of relaxtion as soon as I went into the corporate world and I became complacent with my work life while also trying to get ahead in my career in design. However those two cannot coexist, and I became late on multiple projects that I should've gotten done months before the due date. Empty promises were made that hurt my relationships with clients and unknownable opportuinities were left on the table. But what hurt me most of all was the fact that I ruined my relationship with a significant colleuge of mine. Forgive me lord for my laziness.	2026-02-12 17:22:23.280487	110	sad
65	81c6d85b-7275-4705-b3c9-d749344965ff	70	I would say I have always struggled with self doubt. The imposter syndrome is strong in me. I don't feel quite qualified for much. I feel like I am below average at most things, except I feel like I am good with people. Yet sometimes, I don't know how to people. Recently, the struggle has been real. For someone who is said to be good with people I feel I lack deep meaningful and consistant relationships within my city. I have a lot of friends but none that are consistent locally. I have a best friend that is my rock, without her I would not be able to live. She has saved me more times than I can count. In my own city however, I am so lonely. Even though I go out and I do things and I am active, it is usually solo. Why is it I have such a hard time building steadfast friendship? Especially friendship that is like minded and on a similar journey of personal growth, spirituality and living life to the fullest. I wish I could let go of the hurt and loneliness I feel. Happiness is only real when shared. I want to share my vitality for life. 	2026-02-12 19:42:08.844685	205	grateful
66	e1460926-3474-4f41-9243-8f5113f4ea09	35	The mountain top would be covered with misty clouds that covers the height of the massive rock. The grass is turning from brown to green and the trees are colored orange and red. On one side of the landscape, there is slight rain that potential turns to storms. On the other would be the aftermath after that storm. There's a shed in the middle with wilted wood - looking as if there hasn't been a person caring for the place in a while.	2026-02-13 03:57:08.330733	83	neutral
67	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	5	Coffee, reading, some news, and an uncrowded train ride to work.  Followed by a nice breakfast and an unhurried morning at work. \n\nWhen not working - sunshine, fresh air, coffee and reading. 	2026-02-13 11:41:07.751782	32	happy
68	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	13	I'm looking forward to my recharge - a four week sabbatical from work that is a reward for five years service.  I'm taking part of it on trip with my son, and then the rest of it on a trip to Spain with my wife. \n\nI believe I deserve the reward of a break - and I'm going to maximise my enjoyment. 	2026-02-14 13:58:53.131404	62	calm
69	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	1	Starting my Sunday with my wife, chatting and listening to music before doing some household chores together. \n\nThere is even some watery sunshine and bluish sky poking through the clouds.  \n\nA great start to the day. 	2026-02-15 08:55:27.18322	36	happy
70	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	72	Hmmm - I think I am pretty mindful of the present, most of the time. A reduction of worries and open loops is good for my mental wellbeing and then i feel like I am most in touch with the now and what is going on. \n\n	2026-02-16 10:02:52.953374	46	happy
71	5e98a184-3596-481d-b30f-c18819a78b0d	11	I've gotten a better understanding of my energy since learning about AuDHD. Physical energy is cyclical and pretty straightforward - I have lazy days to physically recharge - on the sofa, long lay-ins, early nights. However, this doesn't always recharge my mental energy. I find that achieving something - however small - is the dopmaine kick I need to do the next thing. Painting a wall, getting to the bottom of the laundry basket, putting a new outfit together. It doesn't really matter what I achieve, it just makes me feel good. Therefore if I ever need to recharge my brain, I start with something tiny and work upwards and outwards from there. 	2026-02-16 14:37:35.332037	113	calm
72	5e98a184-3596-481d-b30f-c18819a78b0d	4	I worry a lot about not living life to the fullest. That my extreme risk-aversion is stopping me from experiencing things. I tell myself that adrenaline-junkie things like extreme travel or sports or theme parks aren't compatible with the things my brain enjoys. It likes being at home, being safe, life being predictable and under control. But there's a fear of missing out. Fear of only experiencing the same things over and over again. Just existing, rather than experiencing or living. I have no idea how to reconcile the need for safety with the desire to experience new things. 	2026-02-17 13:36:55.556329	99	grateful
73	e5e29137-0715-4fb5-b797-709701726e60	59	Wonder is so often conceptualised for the big waterfalls and the skies and the seas.  I love the feeling of looking at big expansive skies especially when I have climbed up to the Malvern hills and can see for miles.\nBut I want wonder in my everyday, what has recently given me a moment of joy and pause is more useful to me.  Yesterday I saw a clump of snowdrops that had big heavy heads drooping towards the ground.  Their shoots have pushed up through the heavy cold winter earth and survived frost and snow and storm.  \nThere is beauty everywhere.\nI adore a blue grey sky - I hate how blue is used for negative emotions as it is such a beautiful colour and the nuance of it fills me with wonder. 	2026-02-18 06:48:06.460841	133	\N
74	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	9	Aaaagh - I missed a day!\n\nWhat made me laugh today is the fun conversation between my wife, myself and our friend in the cooking group.  So stupid, banter about pancakes. 	2026-02-18 10:52:17.486205	31	happy
75	81c6d85b-7275-4705-b3c9-d749344965ff	59	I'm in awe of how nature works in such beautiful flow, every living being having a choreographed purpose. Each action impacts and ripple effects the world. The sound, the smell, the colors, so divinely curated. Nature heals, nature inspires, nature encourages, nature moves, nature constantly changes and evolves....without fail. How I long to be brave like nature. To stand tall, to embrace my changes, to shed what doesn't serve me anymore, to live my fullest and brightest purpose. 	2026-02-18 18:49:13.28821	78	grateful
76	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	71	Wow - I'm not 100% sure I know what this means.  I think I have a fairly constant inner monologue although that reduces when I am relaxed, or when I meditate (which is not frequently enough). \n\n	2026-02-19 09:46:42.805802	36	happy
77	e5e29137-0715-4fb5-b797-709701726e60	42	When I think about my whole life it feels like a melodrama - a kitchen sink classic with all the deaths and abuse and ridiculous losses.\nBut really now it is a quite sunday afternoon family saga - no real drama nothing really happs.  The flashes of big momenst set against long periods where there scenery is the star of the show. \nThere is nothing dramatic about my life these days and I thank the universe for that.  It thank my past self for all the trouble I rode through holding on to hope.  And it did get better.\nNow here I am with my home, my family, my partner and my hobbies living the absolute dream.	2026-02-19 17:24:59.65567	117	\N
78	81c6d85b-7275-4705-b3c9-d749344965ff	71	I would say the space between my thoughts is pretty chill for the most part. I'm not a huge worrier or overthinker, though of course I do have my moments. There are many times during the day I am listening to books and podcasts to continuously learn and grow. I don't usually have a lot of time of silence, which makes me think this is something I could use more of. Being alone with my thoughts without any distractions. Something to work towards. 	2026-02-19 22:34:30.50645	83	grateful
79	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	75	Its enough now - I'm not sure that I would change anything. I'm WFH, its Friday and S is busy in the next room.   I seem to have found a bit more rhythm and energy at work with my new 'co-worker'.  The changes in my role are also good energy. \n\nPlus - the weekend is here, and I get to rest and recharge for the week. \n\nThis Moment is enough	2026-02-20 10:36:44.428415	70	grateful
80	5e98a184-3596-481d-b30f-c18819a78b0d	68	Stillness feels rare. I usually fill my days chasing an itch, or in a broken/recharging mental state. While the latter could be classed as 'stillness', it's still full of noise. Untangling, classifying, processing. True stillness to me is space to think. No physical or mental demands or distractions. Breathing is a big part of it. Feeling my own breath, slowing it down. This creates intentional stillness. I need to create more time for intentional stillness without feeling guilty that I'm not being productive or "getting things done". 	2026-02-20 10:52:03.838001	87	grateful
81	e5e29137-0715-4fb5-b797-709701726e60	66	I have a slight headache - I think it is because there have been and are too many smells.  The Candle I lit earlier has a sweet smell that I don't appreciate too much.\nThe sky is just getting dark, its quite nice to finishe work and there still be some day light left in the day.  \nI am irritable - perhaps its because of the headache but I wonder why some days I can't just bite my tongue. Why I feel like today my skin has been peeled off of my body.  \nEvery sound seems to make me more tense. \nI don't think I have done very well without judgement here\n	2026-02-20 17:27:38.90337	112	stressed
82	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	39	Dear Matt\n\nKeep going - eventually something will bite and this will get to be even more fun. \n\nMatt	2026-02-22 11:21:56.46155	19	neutral
83	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	59	Almost everything to be honest - but quite often, the weather.  I sat for about an hour yesterday watching the sea and the weather moving across it - I've lived by the sea for nearly two years now, and I still find it mesmerising. 	2026-02-23 10:19:54.287746	44	calm
84	81c6d85b-7275-4705-b3c9-d749344965ff	49	There are many routines I am thankful for that I have developed. First, I am thankful I make my bed every morning. I feel accomplished and put together and adult by doing so. It starts my morning off right. Secondly, I make a cup of hot lemon water to help jump start my system. This helps my digestive system get moving and hydrates me. Thirdly, I write in my gratitude journal, it includes; 3 things I am grateful for, what I am going to do today to make it great, and words of affirmation. I have been struggling with this lately as I have been dealing with depression but I have only missed one day and try to find even the littlest thing I can be grateful for no matter how low I am feeling. It helps even on days I don't want to do it. 	2026-02-23 15:45:06.808642	146	grateful
85	81c6d85b-7275-4705-b3c9-d749344965ff	20	I don't have one specific mentor, however I do have plenty of people I look up to and admire for different reasons. I look up to Alyson for being the parent she never had. I look up to Vin and Rachel for continuously being brave by overcoming imposter syndrome and relying on their inteligect to get them where they are today in their career. I look up to Kremer for not letting fear stand in the way of what she really truly wanted. I look up to Michelle for her ability to read and actively listen to people. I look up to Laurie for her vulnerability. I look up to Shareeq for his generosity. 	2026-02-23 15:52:05.05032	114	grateful
86	81c6d85b-7275-4705-b3c9-d749344965ff	48	My simple joy was going to see Laurie perform in her improv class and admiring her bravery for sticking with it. To see her face when I invited her to dinner and when I paid for her meal to congratulate her was such a gift. It warmed my heart how grateful and seen she felt. It is such a powerful feeling to be celebrated, seen and loved on. Every human being should feel this all the time. It is so lonely when you don't feel seen or heard or loved. The heart aches. There is this video of this baby monkey who got punched by his mother and rejected that went viral, he was wanting so much to be loved and I felt for him because I too have felt rejected. My heart broke but when a random monkey took him on and now won't leave his side made me happy. 	2026-02-23 15:57:22.549852	151	grateful
87	e5e29137-0715-4fb5-b797-709701726e60	7	Last year I did really well with introducing new habits.  I started interdental brushing, washing my face and the gym three times a week.  Admitedly the gym replaced running but it was new.\nThis year I want to carry on those habits and add in playing the cello and journalling.  I worry that I am becoming like a habit snowball - just gathering more and more habits that I have to maintain with no additional time in my day.  \nI needed a nap this afternoon and I am about to finish work and feel like I could just get straight back in bed.  Instead I am going to cook dinner and read some of my bell ringing book before going to bed.  I have an in bed asleep target of 8pm.  	2026-02-23 17:21:26.504825	131	sad
88	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	50	Appreciate my brain, and the way I think, speak and develop ideas. 	2026-02-24 11:16:33.820755	12	happy
89	81c6d85b-7275-4705-b3c9-d749344965ff	14	I miss many. I miss my dad, it's been over 5 years since he passed. I miss his laugh. I miss his bad jokes. I miss the time I had, I didn't take advantage of it. I should have been there more for him. I was selfish. I was scared. I wish I would have utilized our time more with getting to know him on a deeper level. In the end I feel like I only knew the surface. I never got to know him underneath the first few layers. What a missed opportunity. 	2026-02-24 13:59:41.895862	94	sad
101	81c6d85b-7275-4705-b3c9-d749344965ff	37	Waking up to hearing birds chirp in the morning, sitting on a porch and listening to crickets on a summer night, listening to a flowing body of water like a stream or a river, or waves crashing on a beach, trees wreslting in the wind, wood crackling in a fire, laughing babies or any laughter at all, the sound of a big crowd clapping, the sound of a big crowd singing in unison. There are endless sounds that make me feel alive. 	2026-03-03 22:07:48.530011	82	grateful
90	e5e29137-0715-4fb5-b797-709701726e60	11	I absolutely need time quietly to myself planning out how I can keep all of the strands of my life in check to feel recharged.  I try very hard to keep on top of everything every day.  That means I have very few actual days off where I am not trying to tick things off my list but I tend to feel less overwhelmed generally as a result. \nI love knitting and reading and walking and jigsaws.  All these things make me feel better but watching TV and scrolling social media makes me feel less energised.  Being in loud environments with lots of superficial conversation is draining to me but being with one friend doing some tasks and really talking about how we feel fills me up with peace and joy.  	2026-02-25 17:19:55.479932	131	calm
91	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	1	Sharing a coffee and a chat with my wife on the train - talking about plans, and ideas we have for the future. Always a lovely way to start the day. 	2026-02-26 10:04:32.988735	31	happy
92	81c6d85b-7275-4705-b3c9-d749344965ff	51	My goodness, so many it is hard to think of which one to write about. I think one challenge that spearheaded a lot of growth was COVID. The challenges I dealt with were vast. Living with a roommate who was super anxious and navigating how to have the freedom to be me and do what I want while considering someone else. Then my dad falling and breaking his hip, causing him to have surgery and then my mom being his full time caregiver with essentially no help. I still struggle with a lot of shame and guilt on this, not being there more to help out. I was selfish and scared. I was selfish because I didn't want to caregive, it is such a hard concept for me. I don't have that inate instinct to do so. I am caring but when it becomes neccessary I freak out and retreat. I was scared because my mom couldn't handle the pressure, she yelled and screamed constantly, which put my nervous system on constant high alert. Then my dad passed, I took charge of the planning and organizing. This was something I knew I could do well enough. Then my friend passed away 2 days after my dad. Another friend of mine was diagnosed with rectal cancer. Again, I didn't know how to handle so I retreated instead of being there for her. Then my mom and I had a falling out after I moved back home. It was the biggest blowout we have ever had. It got physical, I was ashamed it got to this point but I was litterally afraid of her and she kept charging me. That was the last time I saw her. It's been 5 years. My challenge there was feeling like an orphan all of a sudden. I moved to Austin and started discovering who I truly was. I left family behind, and relyed on chosen family instead. The challenges aren't over and maybe they never will be. Now I deal with loneliness. I feel like I found myself but I can only grow so much on my own. I don't have consistant community here and I haven't had a romantic partner in so long. Though, I am proud that my mom and I have reconnected, we haven't seen each other yet, but at least we are talking. So I am hopeful and thankful that it happened before it was too late. Eventually I want us to have the hard conversations. Even though I have my low spells of sadness, shame, loneliness I try to move through it and not stay. This spell in particular is lasting longer than usual, but I am still getting out of bed, making my bed and showing up. 	2026-02-26 15:00:53.821886	458	grateful
93	81c6d85b-7275-4705-b3c9-d749344965ff	5	My ideal morning is natually waking up with the sunshine, listening to the birds somewhere in the mountains. Put on my slippers, make my bed, go to the kitchen put on the kettle, make a cup of hot lemon water and sit on the porch/patio and admire the view with a book in my hand, enjoying the sounds of the world around me waking up. My bestie Alyson is there, we are bundled in the cool crisp air and we are just present. We make coffee and sit and have laughs or just talk. We then make a nourishing breakfast and enjoy it together. We then get dressed for our workout to get the day started off right. None of this is rushed or hurried. 	2026-02-26 16:13:23.242968	125	calm
94	e5e29137-0715-4fb5-b797-709701726e60	23	I have receieved two pieces of wisdom related to my career, three maybe if we include one that I struggle to embody.  \nFirstly when I was struggling personally and wanted to take some time off sick a boss said hold onto what you are good at and where you are doing a good job and don't just give in.  I pulled back a little, took a breath and weathered the storm. \nSecondly I was once told to not equate the job with the career or the profession.  Social work is wide ranging and because a team or a role doesn't fit doesn't mean that all of social work is not for me.\nThirdly to know my worth.  Not to accept less than I should be paid and to hold out for that and not give up - this one is still a work in progress. 	2026-02-26 18:04:16.287968	145	\N
95	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	33	I literally have no idea.... i suspect I'm made of jelly, string and duct tape.  	2026-02-27 09:00:54.423298	15	anxious
96	81c6d85b-7275-4705-b3c9-d749344965ff	47	I think so many people make a difference in our lives, everyday. Sometimes the difference might be so small you don't immediately notice but it can alter your life in a big way over time or you won't realize till much later the impact that was had. So it hard to pinpoint which difference to discuss but this morning I finally decided to open the book The Bhagavad Gita for daily living vol 1-3. There was a sentence in the introduction that hit me so hard I started crying because it was so true to what I was in the moment feeling and what I have been feeling lately that I am having trouble shaking. The author stated that he is writing this book because even people who think they are small can have a big impact on the world. It speared my core. I have been feeling very small lately and directionless with my purpose, and not knowing what to do or how to climb out of this pit my mind seems determined to stay in. This jolted me. Almost shaking the illusion of what I have myself created.	2026-03-02 14:53:24.828177	190	grateful
97	81c6d85b-7275-4705-b3c9-d749344965ff	63	I feel like my breath has been in the shallows for a long time. I don't even notice how shallow it is until I am in yoga and the instructor asks me to take in deep breaths and when I do, I feel like I can't even fill up my lungs that much. Then when I notice my deep breaths are not very deep and the scope of my breath isn't very big, I feel like I'm stuck from being able to grow, I can't expand and take up space. I'm limited. Yet I feel more calm and grounded when I continue the deep breathing. It's so strange to me I can feel constricted and relaxed all at the same time. I am feeling like this a lot lately. 	2026-03-02 16:57:35.668307	129	neutral
98	81c6d85b-7275-4705-b3c9-d749344965ff	48	This past weekend I was in Dallas staying with Kremer and Miguel. I got to spend time playing and loving on Leo which brought me joy, he is such a good sweet baby. We read books, we had meals together, went to the park and watched Miguel fly kites, went down the slide, pushed Leo on the swing, we puzzled, I learned how to play Mahjong, went to yoga, went to the farmer's market, had lunch on a patio, puzzled some more, had game night, cheered on friends for running a half marathon. It was full of simple pleasures. 	2026-03-02 17:01:11.187558	99	grateful
99	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	15	I have everything i need to feel successful. 	2026-03-02 17:37:39.284235	8	neutral
100	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	73	I'm great, thanks for asking.  This morning we booked holidays to spain - expensive, but great to have flights in the bank for the summer. 	2026-03-03 12:08:24.875114	25	happy
102	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	2	I'm grateful for my recharge - five weeks off work with full pay, a sabbatical as a reward for five years service at Meta.   It's a terrific benefit. 	2026-03-04 09:40:42.223403	28	happy
103	e5e29137-0715-4fb5-b797-709701726e60	22	In 5 years I will be 50.  I want to be living in more rural a location with Noah having some independence from me.  I want to be living with Michael and happy together. \nI want to have a small business that is doing well and giving me satisfaction.\nI want to be working less hours in my corporate job. \nI wonder if I will have retrained by then or if I will find that I have enough satisfaction in life. \nI still want to be swimming every week and lifting heavy weights\nI want to be practicing the cello and making craft for my loved ones and home.\nI want to be content \nI hope to still be healthy and active \n	2026-03-04 17:37:08.708533	122	\N
104	81c6d85b-7275-4705-b3c9-d749344965ff	47	Someone wrote a post-it and left it on my desk that said "Have a great day, you rock!" I have no clue who wrote it, but coming to my desk and seeing this really warmed my heart and made my day. I've been feeling a little invisible and withdrawn lately and this was a clear sign I am seen and valued. That is such a strong and impactful feeling to be seen and valued. It's absolutely priceless. Such a small gesture can go so far for people. Knowing the impact this had inspires me to do the same for someone else because I know how good it felt when someone did it for me. Pay it forward. 	2026-03-04 21:32:57.822614	117	grateful
105	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	25	Today I'm going to start building a website for my coaching business.  Thats exciting!	2026-03-05 09:39:31.291206	14	happy
106	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	60	My yoga teacher Judit is amazing - she doesn't get frustrated at my lack of fitness or flexibility and is always so kind and supportive.    I'm grateful to her. 	2026-03-06 09:57:01.341243	29	grateful
107	81c6d85b-7275-4705-b3c9-d749344965ff	73	This has been a tough season of life the last 3 months, where I was not fine or good. There was a really really low moment where I didn't want to be here anymore. Luckily, I have managed to crawl out of that mindset and am choosing to keep moving forward one day at a time. Actively looking for the little joys that make me feel gratitude and make me smile. I recently heard one of my Marines say 'discipline is freedom' and that really struck me. All the little things I do everyday to help my health make a difference and eventually will give me freedom. Freedom isn't given its earned. So as of now I'm hopeful instead of fine or good. 	2026-03-06 14:49:28.197569	123	grateful
108	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	8	I think I've had this before - but my place in Spain takes some beating - warm sunshine, clean space and lovely food makes this a favorite. 	2026-03-07 09:53:41.930009	27	happy
109	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	47	Well.   I guess my boss did.  With a review that seems to trust me and challenge me to do more. I'm grateful for that. 	2026-03-08 11:23:24.176762	24	happy
110	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	52	I am grateful for AI.  Mostly because it is making us rethink our ways of working and will have far reaching effects for future generations.  	2026-03-09 09:16:32.122189	25	happy
111	81c6d85b-7275-4705-b3c9-d749344965ff	35	I would see a desolate barren desert that became an ocean with roaring waves crashing into the sand, further out in the ocean would be calm blue waters, coming out of the calm waters would be gorgeous sturdy and lush mountains, that turn into rolling hills with gardens and farms with little village communities. 	2026-03-09 20:56:22.107093	54	neutral
112	81c6d85b-7275-4705-b3c9-d749344965ff	42	A dramedy for sure. I laugh and laugh and fall apart. Over and over again. There are so many moments that have joyful and hilarious moments, and then there are days when I feel I want to give up and call it quits, where I am crying in yoga. I look back at all the moments I have overcome and I know I have resilience. Some days it feels like the resilience is on a tipping point. I know I have overcome a lot, I know I have found moments of joy in each day. I know I have peed myself from the hilarity of humanity. 	2026-03-09 21:01:17.579314	106	neutral
113	81c6d85b-7275-4705-b3c9-d749344965ff	16	I am proud of the relationships I have built at work. They have brought me so much joy and connection to my life. Some of those relationships completely changing my life, which I am forever grateful. What am I without the people in my life? Life would be meaningless. Happiness is only real when shared. I honestly believe that. \nAnother professional achievement I have is I studied and passed my Associate Professional HR exam. I was worried that I wouldn't pass and that I would have shame for not accomplishing what my bosses invested in. BUT I overcame the anxiety and did the damn thing. 	2026-03-09 21:05:26.505309	105	grateful
114	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	11	Resting and reading and occasionally rotting in front of the the TV	2026-03-10 11:51:44.022141	12	happy
115	81c6d85b-7275-4705-b3c9-d749344965ff	13	I am looking forward to Alyson coming to visit me. Anytime we are together it brightens my soul even in the darkest time. Right now I am going through it and she will be the best prescribed medicine I need. It won't be a forever fix but I know it will give me a solid boost. When we are together the world feels right as rain. Nothing else matters. I'm so present and in the moment. I have never felt that with anyone else. It's truly special. I hate we are so many states a part. But I am thankful I have known this level of pure love and acceptance. I feel so incredibly seen and heard by her, like I belong. 	2026-03-10 15:33:49.508453	122	grateful
116	e5e29137-0715-4fb5-b797-709701726e60	3	The person who has had the biggest positive influence in my life continues to be Michael.  I feel like loving him healed me in so many ways, it has made me a better person because I feel more whole and more able to go into the world and give and expect love in return. \nHe didn't fix me from broken though, I had already done a lot of that work myself - or we absolutely would not have worked out at all.\nBut his steadfastness his everyday hero behaviour has been the rock that I am able to explore the world from knowing I will be met with safety and security at home.\nI cannot express what a difference it has made to my confidence and abilities to have a constant positive cheerleader in my life. I know he doesn't think I am perfect but we are perfect for each other. \nHe is the kindest purest person I have ever met but he hides it well under a gruff misanthropic demeanour. 	2026-03-10 17:07:52.447104	171	\N
117	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	69	I don't really know.    But I'm not sure that I need to let go. 	2026-03-11 15:21:53.894074	14	happy
118	b1969f0b-f503-4136-b633-195d146e5245	12	is this actually saving? I wonder if it is.	2026-03-12 02:22:12.21569	9	anxious
119	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	14	I miss my wife.  This trip with Manu is great, but being on holiday without Sandrine is odd! 	2026-03-12 12:03:18.831356	18	calm
120	5e98a184-3596-481d-b30f-c18819a78b0d	65	The feeling of all processes and sense of purpose at work being eroded/broken. Stresses piling up, most of which are not related to the important work to be done. But also pride at how I'm handling that - not just keeping my head above water - but using self-compassion for long-term balance. Continuing thoughts around AuDHD and how the information around it, and the community around it, will change the way I see and treat myself. Also gratitude, because of the determination and perseverence, years of heartache, have paid off.	2026-03-12 12:14:30.191069	90	happy
121	81c6d85b-7275-4705-b3c9-d749344965ff	69	Letting go would like preparing all of my affairs and setting those up who I love with as much as I can, and then letting go completely. I am ready. 	2026-03-12 15:38:33.054346	30	sad
122	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	48	Spending time with Manu.   And seeing beautiful scenery - two things I don't get to do every day. 	2026-03-13 09:08:25.692479	18	calm
123	5e98a184-3596-481d-b30f-c18819a78b0d	67	I can hear the gusty wind rustling in the trees and shrubs in the garden. I can hear my partner watching a very Amaerican professor on Youtube in the next room. I can hear children playing in the school playground next door - it must be lunchtime. One or two excited voices cut throw the babble. I can hear my own fingers on the keyboard, clacking. I can hear the mechanical timer plug on the wall opposite me, slowly ticking. I can hear the tiny taps of the terrapin gently placing his claws on the side of his glass tank. I can hear the pop-pop-pop of Slack messages coming in. And I can hear the birds outside, chirping to each other, preparing to say goodbye to winter and hello to spring.	2026-03-13 12:31:25.15323	131	grateful
124	b1969f0b-f503-4136-b633-195d146e5245	2	I am so grateful for my job. Yesterday I took my lunch break - maybe a little longer of one, like 2 hours, and went to the museum to see an exhibit that had been on my list for awhile.  So it just made me think that yay flexibility. And I take advantage of the flexibility all the time to take grandma to the doc or myself for that matter.  And use it to pick up Des early awhile ago and even that still comes into my work days.  So it makes me want to use more of my flexibility time for myself cause why not.  And as long as I don't mind doing stuff solo (which I don't - although some things are funner with friends) it works out very well.  I'm just definitely feeling the need to lean into more things just for me.  And even this journaling thing is kinda cool.  I think I liked 750 words better but also I wish there was a smaller version haha cause it's so hard to write 750 words in a day. And it normally takes 15-20 minutes.  Meanwhile this is all about just writing for 3 minutes.  And is a great microhabit idea.  I'm so glad that Matt created this... we'll see if I can keep up with it and if it's helpful. But yeah it's easier to find 3 minutes.  Funnily enough I wonder if I should go even smaller than 15 minutes and do a lot more 5 minute stuff for my business.	2026-03-13 14:18:59.428358	256	neutral
125	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	17	This year I need to 100% master how to get my apps live and monetised. 	2026-03-14 12:52:12.755375	15	neutral
126	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	33	Right now.  At Tromso airport.  In a very long queue.  But I am calm. Everything can wait. 	2026-03-15 09:19:30.409497	17	happy
127	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	25	Onceposted is my postcard site, that seems to be getting some traction.  	2026-03-16 09:38:11.975749	12	happy
128	5e98a184-3596-481d-b30f-c18819a78b0d	23	I have always put a lot of pressure on myself to be a high performer. This has taken its toll on me throughout my studies and career. Therefore, the pieces of advice that have changed my life have been:\n"Sometimes you have to let it fail";\n"Work to live, not live to work"; and\n"That is the organisation's problem, not yours".\nIt is totally unsustainable to feel the weight of a whole project, team or organisation on your shoulders. The weight always has to be shared. Some leaders are better at that than others. But when I start worrying or spiralling about something now, I ask whether it's mine to fix. Mine to carry. Or, whether I'm a smaller cog in a massive machine, and I can spend all of my energy trying to move it, when it doesn't want to move. For me, that's what leads to burnout.	2026-03-16 10:45:52.883765	149	calm
129	ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	4	I would really like to overcome my fear of medical processes and particularly the dentist.   As I get older I need to visit more regularly.  	2026-03-17 09:25:52.024233	25	calm
130	5e98a184-3596-481d-b30f-c18819a78b0d	20	I've had several mentors throughout my career. It would be an interesting exercise to write about them in one place - to compare and constrast. My previous Marketing Director was almost infinitely patient, whilst being clear. My current Line Manager also teaches patience and encourages long-term, sustainable thinking. For (possibly) the first time, I also have a design leader to look up to. I admire their economy of language - direct without being rude - and the confidence in their craft. I am a culmination of all of these mentors and will continue to be shaped by people I respect and admire.	2026-03-17 13:05:40.727833	102	\N
131	e1460926-3474-4f41-9243-8f5113f4ea09	7	I've begun the habit of reading and listening to the bible every day. That was the only habit that I wanted to develop in earlier years but never had the virger to do it. I was blinded by the darkness of the culture instead of looking towards the light. Even when I thought I was holy amongst my peers, I was nothing but a double-minded fool who had haughty eyes. But this year, in this hour, I have changed. Along with praying daily, the things that are vastly different from my youth. Instead of praying for a career advance, I pray for an advancement in my heart. For when I learned about scripture, the Lord places much emphasis on how we conduct ourselves among one another. In a day where media tells us that we are our own kings and gods, It can be hard to understand that but when you think about the things of heaven instead of the things on this earth, then it becomes all the more clear! This is the habit that I have built and want to continue to build. For the righteous person meditates on the word day and night.	2026-03-19 18:24:36.372759	196	grateful
132	e1460926-3474-4f41-9243-8f5113f4ea09	33	A battle between good and evil is afoot. Both sides plan on how they can take over the other but only one can win. The Hermonines are planning to overtake the other side with the many distractions of life. They send woman, bribe with money, and speak false discussions only to overtake them with shrewd planning. The sermonons, the opposition, plan not with there things but with there mind. They are too smart to be bribed and they are too strong to be overtaken. They get power from the holy scriptures and use the sword to overtake them and any other being that comes against them. Though the sermonons seem unable to be defeated, make no mistake, the Hermonines are no easy foe to push back against. A little folding of the hands and the sermonons are overtaken easily with there shrewd plans. So they must always be on there guard. Staying up past midnight and switching shifts with their fellow guards so no sneak attacks happen. They discuss with other wise countries there plans, even when they think that they are absolutely in the right. This battle will not end until both generations pass away...	2026-03-19 22:11:08.492905	196	calm
133	5e98a184-3596-481d-b30f-c18819a78b0d	14	There are too many! But I suppose if I had to pick one, it would have to be my partner. He has taught me so many things. Stretched my mind in new directions. Soundbites like "both feet first", "it doesn't have to be perfect" and "play is how we learn". They help me combat my chronic perfectionism. Things he's said that have made me laugh, like when I was getting stressed about going on a mini-break, and he said "It's an international city, and we have credit cards. If we forget stuff, we'll buy it when we're out there." Sounds obvious, but it totally shattered the way I had approached life up to that point - meticulous planning, no room for error or risk. He's also been my soft place to land when things have gone wrong. Without him, I wouldn't have my MA, wouldn't have been to Germany, Austria or Hungary, and certainly wouldn't have the life I have today.	2026-03-20 12:16:25.623276	161	happy
134	e1460926-3474-4f41-9243-8f5113f4ea09	43	I'll reform this question perhaps...  If no one would ever see it meaning that it wouldn't matter to me if someone saw it or not, I would still create it. If it is this, then it would be a christain allegory cartoon. Since I've actually came to the faith, I realized that I have a duty to give back to God what he has given to me. As I thought about what I should give him, I ran into many road blocks. Many give them their voice however, my voice is fickle. Though not to the caliber I want it to be currently, The only gift that I feel I could give is my art and hope that people would look at it with understanding. As it currently stands, There's a desperate search for something original that C.S. Lewis or J.R.R Tolkien hasn't created. The hobbit and The chronicles of Narnia are master pieces. How can I make something with the fraction of genius as that? Am I even ready to become a writer? Am I even a writer? If I plug this paragraph into an institution or artificial intelligence will they tear it apart and call it no good? These questions of anxiety linger in the back of my mind when thinking about the allegory. Nevertheless, it's best to say that I did something with good effort than to say I didn't do anything at all with great caution	2026-03-21 18:59:21.743673	240	neutral
135	e1460926-3474-4f41-9243-8f5113f4ea09	34	The black, sleek metal stands on the table reflecting my own face when looking at it. It's the first of it's kind so when my fingers touch the edges and lift it to the front, I proceed with caution. It's so simple yet so now. A reflection of how advanced we are. I press on the buttons on the side. Nothing happens. I wait a little while and I get frustrated so I press the button with angry pressure. A small bright light on the front of it gives recognition that I did a job well done. I cracked the code. The light then expands past it secluded shape and covers the entire metal. A shiny object. "Hello" 	2026-03-21 19:09:24.140943	118	\N
136	e5e29137-0715-4fb5-b797-709701726e60	32	A calm colour that seeps through all of the spectrum of life even cooling calming clear.  \nMore even that Green and less bright than yellow\nThe colour of the sky and the sea and my eyes\nPeople say this colour to mean low mood but i think it is strong and deep and beautiful.\nIf grey had more purple and green then it would be this colour perhaps.\n	2026-03-23 17:15:52.235656	68	\N
137	81c6d85b-7275-4705-b3c9-d749344965ff	56	I like all my plants that I have, it livens up the space and makes it feel alive and peaceful. I also have a lot of color going on which brings me joy. I like to buy art in a multitude of forms from my travels so I am reminded of where I have been. I love my meditation corner which is inviting and calming. I love to light candles and insense to elate my senses. I have a soft blanket problem, I love to be around soft fabrics where I can just sink into. 	2026-03-23 21:21:36.835494	95	calm
138	81c6d85b-7275-4705-b3c9-d749344965ff	53	Alyson and Kremer mostly. A lot of my friends provide me comfort and support but I would say consistantly Alyson and Kremer boost me more than most and have the words I always need to hear to let me feel seen and valued. They see things in me that sometimes I cannot or have forgotten within myself. I never come away feeling worse after talking with them, it is always better than I was. Even when I may not believe what they are saying, especially as of late, I feel better in some small way. 	2026-03-23 21:25:13.954132	95	grateful
139	5e98a184-3596-481d-b30f-c18819a78b0d	56	I've always had a very clear goal - to create a home that people feel welcome, safe and loved in. Every life decision I have ever made has led to this house. I've sacrified things, like travelling and expensive hobbies. I've prioritised my career, relentlessly climbing ladders and constantly proving my worth. I can barely believe we're here. This home is for everyone. It really is a little haven, set back from the road, away from the business of life. The garden is tranquil, peaceful. It has limitless possibilities for imagination and play. The kitchen is messy, full and productive. You can always be fed here. The lounge is cosy and a soft place to land. Fluffy blankets adorn oversized sofas. The dining room brings people together. It creates conversation. I love everything about this house and how people feel in it. 	2026-03-24 10:32:10.787825	142	grateful
140	50a439a5-ebeb-47cc-ba61-3ee5d6ad3047	15	I think my definition of success is being completely autonomous and having a lack of worry. I think I equate money with stress and worry and success to me would be walking around in the world without that. Being able to travel whenever I wanted. Buy frivolous things. Always have fresh flowers. Only shop for groceries at Whole Foods. But also to help people. Spend money on friends and initiatives and new company ideas. Or help other start projects. Invest in people. I think I will feel successful when I am able to feel like I am a business owner which I think will be after I amd working consistently and towards a larger goal. I want to do stand up comedy at least once. And write a book. I want for my podcast to reach a larger audience and to tell my story to a larger audience. I think success for me would feel like true and complete freedom from judgement.	2026-03-24 23:41:11.23858	162	\N
141	5e98a184-3596-481d-b30f-c18819a78b0d	19	There's something to unpack here. Because I would instinctively say, "business needs are outweighing and smothering user needs, meaning we'll make the wrong thing". Perhaps more specifically, "our success criteria are not user-centred". Or... "there's a faulty belief that aiming for long term value means we can't, or shouldn't, deliver short term value too". Basically, after 6 months of user-centred design work, we've been handed a JFDI. Very demoralising. And despite having read all the books and done all the training about making a business case for UCD, it all feels impossible because we're in a tiny bubble - tiny cogs in a massive machine. We don't even know who's running the machine - who's deciding the criteria - where the thinking is breaking down. Because of that, there's also no one accountable for what happens if this doesn't change - i.e. making something that will be useful in 5 years time, but is painful today, and that been accepted as 'just what we have to do'.	2026-03-25 14:01:59.920521	167	\N
142	81c6d85b-7275-4705-b3c9-d749344965ff	41	My perfect creative santuary would be a cabin in the woods by a river. It would include chairs around a firepit, comfy patio couches, coffee tables, plants, outdoor grill. Inside there would be a floor to ceiling window looking out in to the woods with a desk against it for writing. I want to be able to be exposed to nature but shaded from direct sunlight. I would have a humming bird feeder by the window. There would be a fireplace in the room, a massive comfy chair that swivels with a automon, a perfect nook for reading. There would be another nook for reading on a windowsill that has comfy pillows and blankets. There would be an art room that has eisels for painting, desk eisels for drawing, knitting and yarn supplies, a pottery wheel, a puzzle table, a sewing table, basically any kind of arts and crafts and the space to do it. 	2026-03-25 21:50:08.734181	155	neutral
143	81c6d85b-7275-4705-b3c9-d749344965ff	66	There are 10 minutes left in the workday. I finished as much as I could of my Marine work before our stop work, while we wait on our long term contract to get officially approved. My ears are popping for whatever reason. I'm a bit thirsty, I think I may have had too much caffeine today. I was also trying to prep for a facilitation tomorrow but Houli hasn't responded back to me so I am feeling slightly unprepared for it. I am feeling less moody today which is a relief. I'm still not 100% back to my usual baseline but positive steps in the right direction is hopeful. I'm less judgy towards myself and more accepting. 	2026-03-25 21:55:05.760753	117	grateful
144	5e98a184-3596-481d-b30f-c18819a78b0d	24	My responses to work life stressors have changed dramatically over the past 6 months. I used to feel a lot of responsibility - for everything. Absolutely everything. And if something wasn't going well, or wasn't on the right track, *I would have to fix it*. I am learning to be a small cog in a massive machine. Some days that makes me feel sad - because I don't feel like I'm contributing as much as I should. But other days I'm grateful that the massive weight of responsibility doesn't sit on my shoulders like it used to. Other people make mistakes. Organisations don't work. Groups don't talk to each other. That's life! I can take pride in doing my job - just my job - as well as I can. I also have many more opportunities to relax than I used to, so feel more balanced overall. This helps spikes of stress 'bounce' quicker. I'm very thankful. Long may it continue.	2026-03-26 12:56:41.751107	161	grateful
145	81c6d85b-7275-4705-b3c9-d749344965ff	58	That ignoring signs doesn't serve me. I don't have to suffer. Not being afraid of taking charge of my health. It can be overwhelming, exhausting, slow moving, costly, but better to face things head on and try to get ahead of issues before it becomes a much bigger and painful problem. Why is being healthy so damn hard? It's so insane to me that it takes so much effort and time and energy to operate optimally. I'm doing it because I want to have a quality of life, and I am thankful I am taking the steps in the right direction no matter how slow. This is a good time for practicing patience. 	2026-03-27 20:50:23.666408	113	grateful
146	81c6d85b-7275-4705-b3c9-d749344965ff	68	To be perfectly honest I haven't taken much time to be still. Why is it that I know what I need to do to help myself flourish in the health sense but for some reason my body resists it. I know meditation helps me, why is it I avoid doing it? I know ice cream and baked goods doesn't serve me, why do I eat them? Why do I self sabotage? I don't know. I really don't. I'm not happy with where I am right now, mentally or physically. Both are obviously connected. I don't like the mental chatter that has been happening. I am extremely unsatisfied with where I am physically. To know what it was like to be in my top shape and to fall so quickly from it is painful. 	2026-03-30 18:21:00.502982	133	neutral
147	81c6d85b-7275-4705-b3c9-d749344965ff	52	Honestly, despite the fears surrounding AI which are completely valid, I will say it has really been helping me learn and think through things. I'm thankful for how it has helped me on numerous occasions. I do think there should be laws surrounding AI. I am glad I am not the one who has to come up with what that would look like. At the moment it has been helping me understand my health. Obviously it shouldn't replace human doctors by ANY means but since I am having a hard time getting immediate communication back from my doctor, it is helping me in the interium. 	2026-03-31 15:45:02.12651	105	neutral
148	81c6d85b-7275-4705-b3c9-d749344965ff	9	Oddly enough I don't remember what made me laugh, but I remember laughing when I was talking with Thomas from work. Mainly our conversation was deep and meaningful but at some point we were both laughing and I can't for the life of me remember what for. Isn't that odd? Our conversation though was heartwarming and comforting, which brought me peace. I smiled when he walked away. I felt truly seen and appreciated by Thomas. How wild is it that someone I barely know could see me so deeply. I am grateful for that interaction. 	2026-04-07 15:54:48.410202	95	grateful
149	81c6d85b-7275-4705-b3c9-d749344965ff	63	It feels small and shallow. Though as I take in a deep breath and feel my belly and chest expand, my nostrils are hit with a sweet smell that elates my senses. Breath is such a fascinating concept. Taking deep steady breaths can calm you and center you, yet we forget breath exists until someone calls it out to you. Like this question. 	2026-04-07 15:58:16.099439	63	grateful
150	81c6d85b-7275-4705-b3c9-d749344965ff	57	I'm grateful I have a job that gives me freedom to live my life. There are so many who don't have my privilages and I try to constantly remind myself of those luxuries that so many do not have. Freedom, a cozy home, food in the fridge, clothes on my back, healthcare. I am blessed and grateful beyond what words can convey. Despite my lows and trials I know what I have. 	2026-04-07 16:24:11.584796	72	grateful
151	5e98a184-3596-481d-b30f-c18819a78b0d	58	I'm grafeful to have learned that my individual voice and perspective is valuable. This feeds into all sorts of other thoughts - like art and science needing each other, like my own personal priorities and values, personal capacity, finding specialisms and crossovers. It has opened my eyes to how we all coexist - with different views, different interests, and how we combine to create something much larger than ourselves. It's taught me how we define and build knowledge. How we share and critique. What information is worth discovering and pursuing. All sorts of things. 	2026-04-08 14:47:37.605291	94	\N
152	81c6d85b-7275-4705-b3c9-d749344965ff	40	Usually doing something creative for someone else is what inspires me. For example, during covid I did some drawings for my friends and mailed it to them, creating art for loved one's birthdays, and baby showers. It always felt more personal to me to make something for someone rather than just buying something generic. It's not often I create something just for me. Not that I mind it really, I am just more motivated when it is for someone else. Seeing other artist's work inspires me. I am usually in total awe of what people creatively come up with. It's so impressive and beautiful. I don't really utilize my creative side anymore. I've lost a lot of zest for life to be perfectly honest. 	2026-04-08 15:46:38.659119	124	neutral
153	81c6d85b-7275-4705-b3c9-d749344965ff	10	I think patience is something I am continuously having to learn over and over and over again. I think back at all the pivotal moments in my life where the universe tested my ability for it and it shows up in every big moment, in every challenge, in every moment of joy even, in all the little moments. What is funny is my patience is pretty well practiced in dealing with others and their limitations, yet when it comes to practicing patience with myself I fail to extend the same courtesy. Especially when it comes to my health, physically AND mentally. I think that I am healthier than I actually am, and therefore end up slacking more than putting in effort and then wonder why I am not further along. My overall health has never been an easy road, that is just not the grace I have been given. I get easily frustrated with my body's cababilities and limits. Though I do usually, express gratitude quickly after my temper tantrums because I know in my heart of hearts that my body does a lot for me and has had it fairly easy compared to what others have had to deal with. I want to let go of the belief that I am always the DUFF (designated fat friend). But I can't deny I am a big girl I guess. What kills me is I got a taste of what it was like to never have to worry about my size, never having to wonder if something would fit, never worrying about muffin tops, having abs for the first time. And then all of that taken away so fucking fast broke my damn heart. Back to being a lump. 	2026-04-09 16:31:01.11595	288	neutral
154	5e98a184-3596-481d-b30f-c18819a78b0d	72	I got cross this morning. It was a work thing. The same classic frustrations I get in every project. I recognised the feeling very quickly. Clenched jaw, shivering, an urge to rant to whoever will listen. The worry that self-advocacy will come across as resistance or negativity. I recognised this behaviour and consciously did something about it. I closed the laptop lid. Walked away. Looked out the window. Thought carefully about what I fancied for lunch. Thought about using two differen ttypes of cheese - for that extra *luxury*. Enjoyed my sandwich in front of my favourite TV programme. Spoilt the cat with crumbs of cheese, much to his delight. Remembered our lives aren't just work. We have a life, a beautiful, easy, fulfilling life. What a priviledge. 	2026-04-10 11:41:42.22207	128	grateful
155	81c6d85b-7275-4705-b3c9-d749344965ff	11	I recharge in several ways. One way that is always a guarantee reboot to the soul is being in nature in some capacity, whether it is a walk on a trail, being out on the water, camping in the woods, being in the mountains, roaming through the vast desert lands, sitting under a tree, laying under the stars. Just observing nature interact with each other and be in awe of just how small we really are in the grand scheme of things. It somehow gets me out of my own head and expands my mind past my own sense of self. Being with friends who I feel like I can be myself around always boosts my spirits. I spend so much time alone, being in community gives me energy and makes me feel alive. Even though I am comfortable alone and have moments of recharge solo as well, the feeling of being with others can't be replicated by myself. Obviously. 	2026-04-10 19:23:06.532356	160	calm
156	81c6d85b-7275-4705-b3c9-d749344965ff	58	This morning I was listening to an episode of The Telepathy Tapes and it really struck a cord with me. Ever since I got back from Peru after experiencing what I did on Ayahuasca, I have struggled. I have been more depressed than I have ever been in my life. It's almost like I know what waits for me on the other side and would rather skip the human school of life and just go straight there. Where love is infinite. Hearing this woman explain her experience so closely to mine was eye opening and comforting. I haven't heard anyone go through that in that way that I felt I could relate to. I just started crying because I felt so understood. The continuous lesson I am learning through this is love. Love is the only thing that matters. I have to embody it, especially towards myself. To bring negative energy in my thinking towards myself is to bring negative energy to all living creatures. I don't want that. At all. This is changing my mind, changing my energy, changing my view, changing my approach, changing how I interact. There is still some resistance but I will keep working on it. For this lesson I am eternally grateful. 	2026-04-13 16:19:03.967873	208	grateful
157	81c6d85b-7275-4705-b3c9-d749344965ff	4	I would like to overcome the fear of not being lovable, not being good enough to love, not being good enough to excell at something, fear of not fully accepting myself, fear I will never be in love and have someone be in love with me back, fear I won't be financially free, fear I will die alone, fear I let my life pass me by, fear I won't find my purpose, fear I won't discover what makes me significant. Obviously these fears are self inflicted, and letting go of attachment of the outcomes is how I let these go. Knowing and doing is definitely not the same thing. I do believe this year has been a hard lesson of living in fear. You can't know joy without suffering. This was my season of suffering. I'm starting to see the value in the lesson. I'm ready to keep applying the lesson towards letting the fear go and live in love. Baby steps. 	2026-04-14 16:02:11.170037	162	grateful
158	81c6d85b-7275-4705-b3c9-d749344965ff	54	Self reflection and self awareness. For me it is so imperative for my personal and professional growth to look inwards on my words and actions, how they impact the world around me. I am constantly learning and growing by taking a look at myself. Having self awareness helps me in developing relationships with others. It helps me to be able to relate with others, to have empathy. I know I am never the smartest person in the room, you can always learn something from ANYONE or any thing or living creature if you are open to receiving it. As I have got older, I am more and more convinced at how much I know and just how very little I know. We know nothing. This allows me to be open and receptacle to changing my perspective, which I feel like happens on a daily basis. What a blessing it is to not be rigid. I love that I can be fluid. I don't feel so attached to ideals where I can't expand. 	2026-04-15 16:23:44.048717	172	grateful
159	81c6d85b-7275-4705-b3c9-d749344965ff	34	I am looking at this gun metal grey rectangle object. There is an odd satisfying feeling I get when I run my hands over it, smooth and sleek to the touch. It weighs a few pounds. There are holes on the side that looks like something could go in there. Two holes are the same size, thin rectangles side by side. The other one looks different, longer in size. It has a long prong like the thing that goes in there would need to match the shape of the prong. \nThe rectangle has an indention on the long side, which allows me to lift the top. It opens to a shiny black surface that reflects my image back at me. There are several squares with letters and numbers and symbols on them. When you touch one it pushes in. 	2026-04-17 20:05:56.24404	139	neutral
160	81c6d85b-7275-4705-b3c9-d749344965ff	37	Live music always makes me feel alive, doesn't matter what kind or genre of music. Music just moves me on so many levels. I love deep listening not only for the lyrics which can definitely pull emotion out of me, but I love listening to the layers. The subtle differences, or anytime there are strings my heart sings. I have had many magical moments at concerts or live performances, heck even just listening to spotify. Listening to music on mushrooms or acid is even more incredible. It hits different and opens my heart and I am able to tap into another level of music appreciation. 	2026-04-20 21:47:55.474535	105	grateful
161	5e98a184-3596-481d-b30f-c18819a78b0d	17	I've spent a lot of time and energy recently questioning and refining my soft skills - how I communicate, advocate for myself, how I explain and justify design work. Maybe I need a renewed push this year on technical skills. The last technical thing I really set my mind to was Figma design systems, which people thought was impressive at the time (!). There's a constant nagging in the industry to use AI tools to link up design and prototyping, but that doesn't interest me. I think it's flawed and wasteful (unless it's something you can use for a clear purpose). I'm most interested in leadership and coaching, but it feels outside of my remit in GDS. Do I go all-in with something like Kotlin or Swift? Again, is that my responsibility as a designer? Or do I pick up a personal project to create a refreshed demonstration of my skills - and where something isn't going to be thwarted or compromised by faulty organisational thinking. Something to plan, I think.	2026-04-21 12:22:45.892341	171	\N
162	81c6d85b-7275-4705-b3c9-d749344965ff	44	One of my favorite memories was feeding and bathing elephants at the Elephant Sanctuary in Thailand. Being near these majestic giant animals was magical beyond words. It bubbled up so much raw emotion of awe and wonder. Putting my hands on these beautiful souls connected something primal in me. My heart exploded. All I wanted to do was be near them and connect. Their tough skin is but an exterior. The playfulness and contentness shone beyond their skin. We got to rub mud on them and play with them in the water. Then we got to scrub and massage them with brushes to clean them off. Getting a kiss by their trunk was thrilling and such a joyful moment. I was so touched by these creatures, tears wouldn't stop coming out of my eyes. Even after we left, I was still so emotional. 	2026-04-22 15:19:09.17168	143	grateful
163	5e98a184-3596-481d-b30f-c18819a78b0d	9	I woke up with a headache this morning. I'm never sure what causes them. Sometimes I can fend them off with painkillers - but this one has settled in for the long haul. My colleagues are very understanding and urged me to take time to recover - but if I took time off every time I had a headache, I'd never be at work! This is all relevant because after battling through a morning of meetings, I zombie-walked downstairs, saw Jon, and the words I said came out of nowhere. "I need a cuddle and cheese on toast". Because he's wonderful, I got both things. It made me laugh because I felt so safe, and so unguarded, that I could express what I needed so clearly. That very rarely happens. A moment of joy and gratitude in a tough day.	2026-04-23 14:23:20.113187	140	grateful
164	81c6d85b-7275-4705-b3c9-d749344965ff	8	My favorite place in the world is wherever my best friend Alyson is. No matter where we are, when we are together life is peachy. We make the most of any situation. ALWAYS. The amount of joy and pure fun we have is insane. There is never a dull moment. Laughter coming out of every orifice. Alyson knows me more than I know me sometimes. I am never lost when she is around. I am utterly and completely myself. I never have to put a mask on. Even when I am in my lowest of lows, the comfort she gives me when we are together, and even when we are a part is priceless. She is my favorite place in the world.	2026-04-23 20:31:34.814637	122	grateful
174	5e98a184-3596-481d-b30f-c18819a78b0d	52	The technology I use the most is tools for organisation. Reminders, calendars, emails. Pretty basic stuff. Repeating events let me forget about something for a while - I don't have to have the constant noise of "has it been 6 weeks yet?" in my head. I appreciate the calm this sort of technology brings to my mind - despite the fact that it might look otherwise! My emails are sorted into folders, making everything easy to find. I feel like if my life is organised, predictable, routine - it's calm. I like the balance of automation (yearly, weekly, daily) and control (creating and managing things myself, in my own way). I think it helps my brain do the right amount of work - the important bits - without reliquishing control completely.	2026-05-08 11:25:25.603541	131	grateful
165	81c6d85b-7275-4705-b3c9-d749344965ff	46	I am beyond grateful for Alyson's ability to zoom out to see what I need to hear. I asked her today if I should hide the quilt Rachel's mom made me out of my dad's shirts because it might be a tender place of friction when my mom comes to visit. And the way she responded was lovingly bringing awareness to me that I was responding from a default method of "walking on eggshells" when it comes to my mom to try to keep me safe. It hit me like a ton of bricks. I don't want to fall back on my old patterns and she helped me to witness that. \nI am grateful for classpass giving me a wide range of fitness options so that I am never bored with my fitness routine. \nI am grateful for Houli, she is such a strong teacher that I wish I would have had growing up. She embodies what a teacher should be like, how teachers should act. Her heart knows no bounds and she always acts with students in mind first. She is someone I aspire to be like. To see her in pain was hard, I'm thankful she trusts me enough to open up and share with me. I am honored. 	2026-04-27 16:14:51.890796	211	grateful
166	81c6d85b-7275-4705-b3c9-d749344965ff	21	I have noticed that when there is a big goal that effects a group of people I find myself in flow states where I am super focused on accomplishing whatever needs to get done. For example, planning a company wide offsite. I want the experience to be smooth and joyful and valuable for everyone involved. Even planning vacations with friends, I am known as the planner in our group, I want people to have a memorable experience. For it to mean something to them. I get so much satisfaction people pleasing. There is probably some aspect of that that is trauma based. However, I have done the work to try not to do that in order to get people to like me. Instead doing it for them, that is my north star. 	2026-04-28 14:39:44.421034	132	grateful
167	5e98a184-3596-481d-b30f-c18819a78b0d	73	It's been a tough start to the week. If you keep getting the same wound over and over, eventually it (probably?) stops healing. I've spent over 2 years trying to do good, user-centred design to help us build the right thing. I've also spent 2 years being told no - there are different priorities that need to take precedence. I don't know how many more times I want to hear that. When do I say enough is enough? There are opportunities to move team and work on something totally different - start fresh. But do I want that upheaval? Do I just accept I'm in a role where they think design is to "make the thing visual" and take the pay cheque? Decisions to make.	2026-04-29 11:59:38.077326	125	anxious
168	176a4e4e-4a31-447b-88ae-5c631dedd892	70	My belief that I am not liked, or loved. Maybe it comes down to the fact that the low self esteem I had when growing up is to some extent still with me. \n\nI cannot seem to escape it's infuance, I want to it to stop.	2026-05-01 02:57:18.019889	46	\N
169	5e98a184-3596-481d-b30f-c18819a78b0d	28	I want to create something that genuinely improves someone's life. This doesn't start with a technology, or a solution. I want to work in a space where the solution can truly be shaped by the problem. Where we can actually say - what do you need? What would help? What is the right place, and where is the right time, to change an existing process? I want to work in a place where my peers respect and fight for objectivity. Experimental validity. Rigour in what we do and why we do it. I want to be inspired by the people I'm trying to help. I don't want to have to justify my existence, or explain my role anymore. I don't want to be told "you just make it pretty". I want to do more. I can easily do more.	2026-05-01 09:57:59.253551	139	\N
170	81c6d85b-7275-4705-b3c9-d749344965ff	58	I'm thankful I have learned and am still learning patience and the art of letting go or breaking attachments to things. Attachments to things cause suffering. Attachment to the way life is, or holding on to an idea or lifestyle, causes pain and suffering when things are disrupted. It's a daily thought and practice but not letting things get to me or at least trying not to has helped with acceptance. Change is guaranteed. Ride the waves of it rather than swim upstream. Being rigid and inflexible also causes suffering and friction. What is the point of being so bent out of shape about things that are out of our control. 	2026-05-04 19:20:45.712535	111	grateful
171	5e98a184-3596-481d-b30f-c18819a78b0d	69	Turning off the phone. Walking away. Being outside. Having autonomy. Buying the flowers. Cleaning, restoring, improving. Listening. Creating, building. Giving time to the things I want to give time to. Being selfish. Caring about details, but the ones that only matter to me. 	2026-05-05 11:59:39.378828	43	stressed
172	81c6d85b-7275-4705-b3c9-d749344965ff	1	I received an email from Team Rubicon, a nonprofit organization that deploys volunteers to disasters to help the local community. A buddy of mine Rob, told me about an event next Saturday that is close by so I signed up to volunteer. I went through the training this morning and submitted my background info in hopes to become more involved with the organization. I am really looking forward to helping communities in need and building connection with the other volunteers. I like the idea of being able to help someone on their worst day. To provide some sort of relief and humanity in the face of disaster. Feels like the right thing to do and that makes me happy. 	2026-05-06 16:25:16.031939	119	grateful
173	5e98a184-3596-481d-b30f-c18819a78b0d	35	I see a dark sea of tumbling waves, and a small, white sailing boat trying to stay on course. Some days are calmer, some are more desperate. But the need is to keep, roughly, in the right direction and accept some days will have better progress than others. Some days are beautiful. The sun glints off the water. Gentle spray feels refreshing. Other days are hazardous. Overwheming forces of the waves threaten to overturn the boat and halt any further progress. The skies are dark and unforgiving. Light is scarce. These are the days when self-preservation has to come first. And I must remember that not all of the days are like this. Brighter, easier days will come.	2026-05-07 12:44:02.914455	118	neutral
175	176a4e4e-4a31-447b-88ae-5c631dedd892	61	The issuie at the moment is that I do not really know how I feel. Of late, life has lost something. I am not even sure what it is, maybe the sense of calm or my ability to deal with basic day to day issuies. \n\nI used to be able to rise above most things, now it feels like I am underconstent strain. \n\nI want some peace, but nothing is achived without a plan. I need to make a plan a follow though. 	2026-05-09 04:15:23.699448	83	anxious
176	5e98a184-3596-481d-b30f-c18819a78b0d	25	I'm excited to share my experiences as a new (ish) Civil Servant, because I think I've learned things the hard way, that I could share to help people going through similar things. Things about yearly patterns/cadences, leadership/decision making structures, identifying roots of conflict or tension (differing opinions do not need to be personal or emotional). I can do this through an "About Me" session, or something more pointed. "From rock'n'roll to democracy: Learning how to be a Civil Servant" (!). 	2026-05-11 10:53:27.798949	80	\N
177	81c6d85b-7275-4705-b3c9-d749344965ff	21	Knowing that I made a positive impact somewhere somehow is what drives me. If it helps someone out, helps save time, if it improves a system, or makes someone feel good, or happy then I will work hard. I have noticed with working for the Army, because they didn't value what I brought to the table, I quit putting in a ton of effort. But when the Marines asked me to do something I am on it so quick because I know they will appreciate it more. I've been helping Shana plan Alyson's bday, since she has been dealing with a lot of personal stuff, I worked hard at it because I want Alyson to feel special and know she is loved. 	2026-05-12 16:37:07.985292	122	grateful
178	81c6d85b-7275-4705-b3c9-d749344965ff	30	I prefer to receive feedback in a timely fashion and with complete honesty. It is a continuous practice to receive without defending myself, I remind myself to be open to it. It is how I will learn and grow. It can be hard to receive feedback but the more I get it the easier it will be to receive and move towards action on improving. I am FAR from perfect. Sometimes I may not see what others see and will need to be told. And that is ok. 	2026-05-12 16:40:12.583961	88	calm
179	81c6d85b-7275-4705-b3c9-d749344965ff	64	My body is telling me that it is feeling stronger. This year has been a struggle on the health front but I feel like I am on a healthy path and I am working towards doing what I think is best for my body without completely saying no to everything or overcorrecting in an extreme way. I feel more accepting and content with my body. My body is what it is. I can control what goes in my body and how I treat it. I think I am doing a pretty good job and will keep working towards healthy goals. I want treat this meat suit with respect and love. 	2026-05-12 16:43:54.593932	110	grateful
180	81c6d85b-7275-4705-b3c9-d749344965ff	74	Self compassion today looks like feeding my body with healthy nutrition, like my smoothie I make every morning, my hard boiled eggs + kiwi for snacks, my overnight, and meal prepped dinners. Plus I have pilates reformer today to work on strength and tone of my muscles. I finished planning for Alyson's bday weekend, which I was happy to pretty much take over for Shana while she is dealing with personal stuff. Feels good to help folks out and of course do something nice for my bestie. I also plan on taking some online courses for Team Rubicon which is an organization I am volunteering for this weekend, and I hope to do more for. 	2026-05-12 16:47:25.467305	115	grateful
181	5e98a184-3596-481d-b30f-c18819a78b0d	75	If this moment were enough, I wouldn't start each day by opening LinkedIn and clicking on 'Jobs'. I would appreciate the flexibility and important, if small, contribution I'm making to a bigger picture. I would put less pressure on myself to adhere to every contradictory rule, every micro-decision, every process that gets forgotten, washed away and unofficially scrapped. I would be freer. I would judge myself on quality of thought and my craft, rather than watching the number of minutes tick by sat at a laptop. I would hide less. Speak more. I would value my own opinion. I wouldn't be trying to think three steps ahead, crafting conversations that should be easy. I would be making good things. I would be proud of what I do and enjoy doing it.	2026-05-13 11:11:09.646746	131	neutral
\.


--
-- Data for Name: feature_votes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.feature_votes (id, feature_id, visitor_id, vote_type) FROM stdin;
1	1	d36fa761-5dde-4b79-90fa-a15359bd9682	up
2	7	d36fa761-5dde-4b79-90fa-a15359bd9682	up
\.


--
-- Data for Name: features; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.features (id, title, description, upvotes, downvotes, is_user_suggested, created_at, suggested_by_user_id) FROM stdin;
2	Word Cloud	Visual display of your most-used words and recurring themes	0	0	f	2026-02-01 21:23:37.909231	\N
3	AI Writing Insights	AI-powered analysis highlighting recurring themes and personal growth patterns	0	0	f	2026-02-01 21:23:37.938953	\N
4	Favorite Entries	Star entries to revisit your best writing and meaningful moments	0	0	f	2026-02-01 21:23:37.972376	\N
5	Anonymous Prompt Sharing	Submit your own prompts for others to use anonymously	0	0	f	2026-02-01 21:23:38.002663	\N
6	Share Achievements	Share milestone badges on social media to celebrate your progress	0	0	f	2026-02-01 21:23:38.033194	\N
8	Custom Themes	Personalize your writing space with custom color schemes and fonts	0	0	f	2026-02-01 21:23:38.093395	\N
1	Mood Trends Dashboard	Visualize how your mood changes over weeks/months with interactive charts	1	0	f	2026-02-01 21:23:37.8734	\N
7	Browser Extension	Quick-capture thoughts from anywhere with a browser extension	1	0	f	2026-02-01 21:23:38.063472	\N
\.


--
-- Data for Name: magic_link_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.magic_link_tokens (id, email, token, expires_at, used_at, created_at) FROM stdin;
53f7ba8a-77f0-498d-ba9a-3e8aa7501929	matt.rutherford@gmail.com	e751ede298cb58a58e70867bb54f8179818e8c7b57e3ba85d963e9a3f18fc583	2026-02-12 15:00:38.534	2026-02-12 14:46:12.488	2026-02-12 14:45:38.551336
70ad71bd-5d41-481d-ae6a-1e6aa57e389e	matt.rutherford@gmail.com	87e5136791ff96c0d64852ba892a8554528d4ca88c19dfc04de2e74279570095	2026-02-12 16:27:31.765	2026-02-12 16:13:05.645	2026-02-12 16:12:31.783322
1521aaee-84b7-4245-a2e9-011d85acf443	elise.robinson@hotmail.co.uk	2dc775624577e2cf9bd9453f62276a7077a6b84d97473e14fb656213554eaa35	2026-02-16 14:45:15.91	2026-02-16 14:30:37.857	2026-02-16 14:30:15.924693
487c3840-6dac-438d-88d3-80d6a70b4202	ambermarieslone@gmail.com	bf885d9c6e1ea75838097eb4b73efe31876f01216ac8a1c456e86184efdcf726	2026-02-18 12:01:03.143	2026-02-18 11:46:17.407	2026-02-18 11:46:03.159209
cb0cc782-08fb-42a3-bbbb-e156e8d14c41	ambermarieslone@gmail.com	6bd2e7956b1426503ef584a372bd94b92eafb082c701c164b2cc9bb0aaaad668	2026-02-18 12:04:33.75	\N	2026-02-18 11:49:33.763939
d6b99769-73d7-446a-beac-c826d759d145	ambermarieslone@gmail.com	857bfb5eb9720bb8e7bdcb84a2376a637cfafb84f95390fa24ef539b9c7d80cb	2026-02-24 14:11:01.369	2026-02-24 13:56:09.135	2026-02-24 13:56:01.385032
b3104de7-50e8-4752-ad1f-708fd4ee383c	halaq@scanwave.io	cf27d0c6e4bc2dc5cd12776cf9751bf27307a2fb4fc703a439e2a081fde1828a	2026-03-02 19:37:44.535	2026-03-02 19:23:05.899	2026-03-02 19:22:44.555136
ebe44986-10bc-4ac7-93f2-295a454a7559	jessica.la.williams@gmail.com	51412b03bc15e99fa1df20b068bc6353e3f55d6935ab380b3814df2ab20786d6	2026-03-12 02:35:31.594	2026-03-12 02:21:00.594	2026-03-12 02:20:31.610141
9f5f906b-5d52-48d9-b633-b4bba5757eaf	katpli@protonmail.com	4ad0524c1461d8064f8fd5db5ddbe6af47157d6058524e395fb14347a105bd30	2026-03-12 20:33:51.98	\N	2026-03-12 20:18:51.99573
2f8f3fc6-cd74-46af-b4b1-e6e1edaa5b2e	jessica.la.williams@gmail.com	8225adeadfdfcc0185271f919aeba2372e7bfe64059d53b2c2c3c0ba8cbcffad	2026-03-13 14:29:54.569	2026-03-13 14:15:02.027	2026-03-13 14:14:54.585807
f6c0c50d-bf28-43d7-8391-a8e66bc43621	jeanmawhite@outlook.com	92b3fbc8aa1598f3312a13df42a24403075ddf1fb768a2c8638ca24bac2a77f6	2026-03-22 19:34:26.461	2026-03-22 19:20:18.104	2026-03-22 19:19:26.477024
fa00481f-b098-4972-bd8e-db75f4937fd3	barnettsarahj@gmail.com	cfce248d3a4f1705626feae8408dd761492b6e1cb06867aad7faa07189033170	2026-03-24 23:52:20.038	2026-03-24 23:37:27.843	2026-03-24 23:37:20.053118
7d72c9fa-1d2f-4887-8b3f-e287257dbfb1	katpli@protonmail.com	59ed13f8df2c36ae6b6d0ce8b2a6b9bb4793a2991541e16465fa9ce9182ab360	2026-04-06 05:48:30.062	2026-04-06 05:33:46.053	2026-04-06 05:33:30.079225
e29b37d3-b9de-4b41-9b12-a3ad96e0c102	matt.rutherford@gmail.com	b6e2ff0712f5c0e1747e0a6ca55d84316981fbb10af0498dcd378d3c50a96cd0	2026-04-07 19:07:51.128	2026-04-07 18:53:04.281	2026-04-07 18:52:51.143845
d8e35b35-c0b5-4797-9a6e-143fa6e718ac	kimdellanzo@gmail.com	78ec42c14ad40e95d796548ff6e64256f040ada4a9c30ba9947619aa34ab695b	2026-04-24 14:23:20.153	\N	2026-04-24 14:08:20.167387
5463f942-9e52-4e2c-a7f5-60b60a9c7c08	kimdellanzo@gmail.com	5c3c4a0418ba413632f9f79e3cef7fe6bc867f8f200886d7e46b6d68c6cb10da	2026-04-24 14:24:15.953	2026-04-24 14:09:31.933	2026-04-24 14:09:15.967672
a986e21e-ab76-4f8d-bfa3-1375185e2b65	jessica.la.williams@gmail.com	94b78f72296e8298ec9ad07c5f2c55529adf0dc0fb68ddb19fa67ad9d0da7471	2026-04-28 15:53:36.778	2026-04-28 15:38:43.355	2026-04-28 15:38:36.796584
d3b0fc87-61a6-4f15-96ef-58126d082077	matt.rutherford@gmail.com	676857a86e60b5664df7e3cdcc80e3dc37250f249edb00c133f39c9856c9c318	2026-04-29 09:17:32.567	2026-04-29 09:02:42.296	2026-04-29 09:02:32.584386
4ac58c28-777b-41db-afdd-7a0cdad55199	stephaniemoakes@hotmail.co.uk	bdf6a50c4b02789a83708c24f66fd4f097651480af26e5a65f7f914ac073fa46	2026-05-03 11:01:58.493	\N	2026-05-03 10:46:58.510641
e6dc6d42-ffd9-4a3b-abc6-bcf1655187cc	stephaniemoakes@hotmail.co.uk	44bfeb4076205d328e99eee5aad2a2ced86d307d539051ff028a58cee8436a36	2026-05-03 11:21:58.973	2026-05-03 11:07:10.657	2026-05-03 11:06:58.988182
2a583a6e-1ca7-46dd-ba9f-f985a580119e	nataliadragutu@gmail.com	358c2891d84a7a8e2a0c65030e5fb1365ba915b173dfc35f692da2b66e84f141	2026-05-06 20:36:48.555	2026-05-06 20:21:55.376	2026-05-06 20:21:48.571989
\.


--
-- Data for Name: prompts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prompts (id, content, category) FROM stdin;
1	What is a small moment today that brought you joy?	Life
2	What is something you are grateful for right now?	Life
3	Describe a person who has positively influenced your life.	Life
4	What is a fear you would like to overcome?	Life
5	What does your ideal morning look like?	Life
6	If you could talk to your younger self, what would you say?	Life
7	What is a habit you want to build?	Life
8	Describe your favorite place in the world.	Life
9	What made you laugh today?	Life
10	What is a lesson you learned the hard way?	Life
11	How do you recharge your energy?	Life
12	What is a book or movie that changed your perspective?	Life
13	What is something you are looking forward to?	Life
14	Who do you miss right now?	Life
15	What is your definition of success?	Life
16	What is a professional achievement you are proud of?	Career
17	What is a skill you want to develop this year?	Career
18	Describe your ideal work environment.	Career
19	What is a challenge you are currently facing at work?	Career
20	Who is a mentor you admire and why?	Career
21	What motivates you to work hard?	Career
22	Where do you see yourself in 5 years?	Career
23	What is the best career advice you ever received?	Career
24	How do you handle stress at work?	Career
25	What is a project you are excited about?	Career
26	What is a mistake you made at work and what did you learn?	Career
27	How do you balance work and personal life?	Career
28	What is your dream job?	Career
29	What value do you bring to your team?	Career
30	How do you prefer to receive feedback?	Career
31	If you could create anything without limitations, what would it be?	Creativity
32	Describe a color without using its name.	Creativity
33	What does your inner world look like?	Creativity
34	Write about an ordinary object as if seeing it for the first time.	Creativity
35	If your emotions were a landscape, what would you see?	Creativity
36	What would you build if you had unlimited resources?	Creativity
37	Describe a sound that makes you feel alive.	Creativity
38	If you could live inside any artwork, which would you choose?	Creativity
39	Write a letter to your future creative self.	Creativity
40	What inspires you to create?	Creativity
41	Describe your perfect creative sanctuary.	Creativity
42	If your life were a movie, what genre would it be?	Creativity
43	What would you make if no one would ever see it?	Creativity
44	Describe the texture of your favorite memory.	Creativity
45	What story is waiting to be told through you?	Creativity
46	What are three things you're grateful for today?	Gratitude
47	Who made a difference in your life recently?	Gratitude
48	What simple pleasure brought you joy this week?	Gratitude
49	What part of your daily routine are you thankful for?	Gratitude
50	Name something about your body you appreciate.	Gratitude
51	What challenge helped you grow?	Gratitude
52	What technology are you grateful exists?	Gratitude
53	Who believed in you when you needed it most?	Gratitude
54	What skill do you have that you're thankful for?	Gratitude
55	What memory always makes you smile?	Gratitude
56	What about your home brings you comfort?	Gratitude
57	What opportunity are you grateful for?	Gratitude
58	What lesson are you thankful to have learned?	Gratitude
59	What in nature fills you with wonder?	Gratitude
60	Who has shown you kindness recently?	Gratitude
61	What are you feeling right now, in this moment?	Mindfulness
62	Describe five things you can see around you.	Mindfulness
63	What does your breath feel like right now?	Mindfulness
64	What is your body telling you today?	Mindfulness
65	What thought keeps returning to your mind?	Mindfulness
66	Describe the present moment without judgment.	Mindfulness
67	What can you hear if you listen carefully?	Mindfulness
68	How does stillness feel to you?	Mindfulness
69	What would letting go look like for you?	Mindfulness
70	What are you holding onto that no longer serves you?	Mindfulness
71	Describe the space between your thoughts.	Mindfulness
72	What brings you back to the present moment?	Mindfulness
73	How are you truly, beyond 'fine' or 'good'?	Mindfulness
74	What would self-compassion look like today?	Mindfulness
75	If this moment were enough, what would change?	Mindfulness
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
1HCqfao2vAuFdOOrC2KOe8i4LBtNePe1	{"cookie": {"path": "/", "secure": true, "expires": "2026-06-02T11:07:10.686Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "89cfff2b-970c-4696-8152-227c7d4fa3d4"}}	2026-06-02 11:07:14
mzqEo3EZY15smQf4fi0s4Zz-pcYb5_XH	{"cookie": {"path": "/", "secure": true, "expires": "2026-03-18T14:30:37.889Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "5e98a184-3596-481d-b30f-c18819a78b0d"}}	2026-06-12 11:11:23
qxbvL6Mefh_TebPTonuRCx1vBjlQY9Mm	{"cookie": {"path": "/", "secure": true, "expires": "2026-05-29T09:02:42.327Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5"}}	2026-05-29 09:03:18
OG0A6jj9fobaB2FzeMA8L01eneY_pJAa	{"cookie": {"path": "/", "secure": true, "expires": "2026-03-13T15:12:03.636Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "81c6d85b-7275-4705-b3c9-d749344965ff"}}	2026-06-13 22:32:26
xKmFcoBP2DYMlep5rddkDliQ0U5JqDvG	{"cookie": {"path": "/", "secure": true, "expires": "2026-03-10T22:19:18.627Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "e1460926-3474-4f41-9243-8f5113f4ea09"}}	2026-05-27 04:59:18
o38zXfcP7obvjTNDKmFnt-SxfSbXkoSw	{"cookie": {"path": "/", "secure": true, "expires": "2026-06-05T20:21:55.408Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "9bdd8003-409b-487e-8c9e-e79d5ef8192c"}}	2026-06-05 20:22:30
UQROwkOXR_1qN1GimXHNH78t6p5-vgwF	{"cookie": {"path": "/", "secure": true, "expires": "2026-04-23T23:37:27.872Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "50a439a5-ebeb-47cc-ba61-3ee5d6ad3047"}}	2026-05-25 21:50:22
O50Ol7tnqG7Y7d-SmuTFrsG4NkF1jwSk	{"cookie": {"path": "/", "secure": true, "expires": "2026-05-28T15:38:43.390Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "b1969f0b-f503-4136-b633-195d146e5245"}}	2026-05-28 20:58:25
7u4T7DLYgjFB_ZLhMTuWHXYhEwrwpGQm	{"cookie": {"path": "/", "secure": true, "expires": "2026-03-05T09:49:13.288Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "176a4e4e-4a31-447b-88ae-5c631dedd892"}}	2026-06-08 04:15:30
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, first_name, last_name, profile_image_url, created_at, updated_at, username, password, reminder_enabled, reminder_time, reminder_timezone, is_email_verified, email_verification_token, email_verification_expires, welcome_email_sent_at, daily_word_goal, weekly_summary_enabled, last_weekly_summary_at, last_reminder_sent_at) FROM stdin;
3bb044a7-cc42-432e-bea4-c73c28c47c78	\N	\N	\N	\N	2026-01-12 12:42:17.809752	2026-01-12 12:42:17.809752	elise.robinson@digital.cabinet-office.gov.uk	$2b$12$imTqIUHUJ5zEuc8/MYHzW.UkzxL1gIt1RKKQTYM5JnA3DEvEV4wty	f	09:00	America/New_York	f	\N	\N	\N	\N	t	\N	\N
69fbab1e-4c9d-49f3-95e1-6a0f9e1c9d42	mburtgracik@gmail.com	Mel	\N	\N	2026-01-13 00:36:21.4278	2026-01-13 00:36:21.4278	mburtgracik@gmail.com	$2b$12$wDt.YAYT185Fa.NFRMriUuxy463fe4jsWvnOxlygRgCvjJeA3OuVK	f	09:00	America/New_York	f	\N	\N	\N	\N	t	\N	\N
89cfff2b-970c-4696-8152-227c7d4fa3d4	stephaniemoakes@hotmail.co.uk	Stephanie	\N	\N	2026-05-03 10:46:58.461442	2026-05-03 10:46:58.461442	stephaniemoakes@hotmail.co.uk	\N	f	09:00	America/New_York	t	\N	\N	\N	\N	t	2026-05-10 18:00:01.892	\N
5e98a184-3596-481d-b30f-c18819a78b0d	elise.robinson@hotmail.co.uk	Elise	\N	\N	2026-02-16 14:30:15.761721	2026-02-16 14:30:15.761721	elise.robinson@hotmail.co.uk	\N	f	09:00	America/New_York	t	\N	\N	\N	\N	t	2026-05-10 18:00:01.892	\N
b1969f0b-f503-4136-b633-195d146e5245	jessica.la.williams@gmail.com	Jessica	\N	\N	2026-03-12 02:20:31.565282	2026-03-12 02:20:31.565282	jessica.la.williams@gmail.com	\N	f	07:00	America/Chicago	t	\N	\N	\N	\N	t	2026-05-10 18:00:01.892	2026-04-28 07:00:01.653
6ec73680-acee-4974-ac2e-07bf4be9baae	halaq@scanwave.io	Hala	\N	\N	2026-03-02 19:22:44.507304	2026-03-02 19:22:44.507304	halaq@scanwave.io	\N	f	09:00	America/New_York	t	\N	\N	\N	\N	t	2026-05-10 18:00:01.892	\N
7678d731-0a29-400c-9152-d226f867f162	silverlining@mailbox.org	Jess	\N	\N	2026-01-24 12:17:25.335956	2026-01-24 12:19:26.994	silverlining@mailbox.org	$2b$12$jQU93oH3b3QhPhTCUI72g.M9HCMJpnGk2XrG705.tZFcnL/T0Ncoi	f	09:00	America/New_York	t	\N	\N	2026-01-24 12:19:26.994	\N	t	2026-05-10 18:00:01.892	\N
e1460926-3474-4f41-9243-8f5113f4ea09	kwaym88@gmail.com	Mr. Wayne	\N	\N	2026-02-08 22:19:18.258438	2026-02-08 22:19:18.258438	kwaym88@gmail.com	$2b$12$6i0hezNjDsEtEhk6qRgxPOZiUgsddec5E5r15S0/Dlkwsjtf1/Lvy	f	09:00	America/New_York	f	\N	\N	\N	\N	t	\N	\N
76a1ed71-3657-4da1-91be-2c2cca6988dc	mariatranpizzi@gmail.com	Maria	\N	\N	2026-01-21 20:24:30.898563	2026-01-21 20:27:45.262	mariatranpizzi@gmail.com	$2b$12$o9zZQ2FDY6vfPY8VMo7q2uR8a41z9fWpk6a5tC0EopUPBbroD85Mi	f	09:00	America/New_York	t	\N	\N	2026-01-21 20:27:45.262	\N	t	2026-05-10 18:00:01.892	\N
d8c9102a-7287-43b7-8103-79d1f5c2abf6	mefrancesd@gmail.com	Frances D	\N	\N	2026-02-10 01:47:05.484549	2026-02-10 01:47:05.484549	mefrancesd@gmail.com	$2b$12$Wj2BL4DkKECgVo5x44B8zePkcoQ0/eGnUHio70pqTVu0Ygf5Vx.12	f	09:00	America/New_York	f	\N	\N	\N	\N	t	\N	\N
50a439a5-ebeb-47cc-ba61-3ee5d6ad3047	barnettsarahj@gmail.com	Sarah	\N	\N	2026-03-24 23:37:19.943733	2026-03-24 23:37:19.943733	barnettsarahj@gmail.com	\N	f	09:00	America/New_York	t	\N	\N	\N	\N	t	2026-05-10 18:00:01.892	\N
81c6d85b-7275-4705-b3c9-d749344965ff	ambermarieslone@gmail.com	Amber	\N	\N	2026-02-11 15:12:03.343174	2026-04-10 19:15:08.871	ambermarieslone@gmail.com	$2b$12$Q8wgGyZlY926ii5sOQYDUOEjUI3y4WswBLGzeu/.RzPM90oi1Q446	t	08:00	America/Chicago	t	\N	\N	2026-02-11 15:17:45.312	100	t	2026-05-10 18:00:01.892	2026-05-15 08:00:02.598
176a4e4e-4a31-447b-88ae-5c631dedd892	ssbhambra1980@gmail.com	Theepwood	\N	\N	2026-01-31 13:50:34.266826	2026-02-01 04:57:36.581	ssbhambra1980@gmail.com	$2b$12$6JfzZY9igBvEQ9pKLjrOb.4uBBjvzPgcksECGOd4Gy1f3p1D5/Ve2	t	08:00	Europe/Berlin	t	\N	\N	2026-02-01 04:57:36.581	\N	t	2026-05-10 18:00:01.892	2026-05-15 08:00:02.598
e5e29137-0715-4fb5-b797-709701726e60	Marie.pye@bridgesoutcomes.org	Marie	\N	\N	2026-01-20 11:25:11.845249	2026-01-20 11:30:32.978	mariepye@yahoo.co.uk	$2b$12$/.MBMfhpugPHbNyjZIw5E.QqZt5plD1XBE.qsm5xh8T56t0p0.k5m	t	17:00	Europe/London	t	\N	\N	2026-01-20 11:30:32.978	\N	t	2026-05-10 18:00:01.892	2026-05-15 17:00:03.243
59f0dd95-afdc-462f-9108-feb3b8d46897	jeanmawhite@outlook.com	Jean	\N	\N	2026-03-22 19:19:26.428269	2026-03-22 19:19:26.428269	jeanmawhite@outlook.com	\N	t	21:00	Europe/London	t	\N	\N	\N	\N	t	2026-05-10 18:00:01.892	2026-05-15 21:00:01.807
ee736ed0-c519-45ff-a04b-ca417f224886	katpli@protonmail.com	Katerina	\N	\N	2026-03-12 20:18:51.879625	2026-03-12 20:18:51.879625	katpli@protonmail.com	\N	f	09:00	America/New_York	t	\N	\N	\N	\N	t	2026-05-10 18:00:01.892	\N
a2bcd19d-90ae-4406-b68d-2d09e3acb691	kimdellanzo@gmail.com	Kim	\N	\N	2026-04-24 14:08:20.125736	2026-04-24 14:08:20.125736	kimdellanzo@gmail.com	\N	f	08:00	America/New_York	t	\N	\N	\N	\N	t	2026-05-10 18:00:01.892	\N
9bdd8003-409b-487e-8c9e-e79d5ef8192c	nataliadragutu@gmail.com	Natalia	\N	\N	2026-05-06 20:21:48.512025	2026-05-06 20:21:48.512025	nataliadragutu@gmail.com	\N	f	20:00	Europe/London	t	\N	\N	\N	\N	t	2026-05-10 18:00:01.892	\N
ab1a629a-ca3a-4c1f-a729-cf9d9f8ef6c5	matt.rutherford@gmail.com	\N	\N	\N	2026-01-11 17:22:55.726321	2026-01-14 21:50:58.703	matt.rutherford@gmail.com	$2b$12$otUnG5DkM1piHuXMWw9rOei0kscmFxGfypsa4LIAWB49g4U72upeS	t	09:00	Europe/London	t	\N	\N	2026-01-12 20:58:16.016	200	t	2026-05-10 18:00:01.892	2026-05-16 09:00:02.038
\.


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE SET; Schema: _system; Owner: -
--

SELECT pg_catalog.setval('_system.replit_database_migrations_v1_id_seq', 6, true);


--
-- Name: entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.entries_id_seq', 181, true);


--
-- Name: feature_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.feature_votes_id_seq', 2, true);


--
-- Name: features_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.features_id_seq', 8, true);


--
-- Name: prompts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.prompts_id_seq', 75, true);


--
-- Name: replit_database_migrations_v1 replit_database_migrations_v1_pkey; Type: CONSTRAINT; Schema: _system; Owner: -
--

ALTER TABLE ONLY _system.replit_database_migrations_v1
    ADD CONSTRAINT replit_database_migrations_v1_pkey PRIMARY KEY (id);


--
-- Name: entries entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entries
    ADD CONSTRAINT entries_pkey PRIMARY KEY (id);


--
-- Name: feature_votes feature_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_votes
    ADD CONSTRAINT feature_votes_pkey PRIMARY KEY (id);


--
-- Name: features features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.features
    ADD CONSTRAINT features_pkey PRIMARY KEY (id);


--
-- Name: magic_link_tokens magic_link_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.magic_link_tokens
    ADD CONSTRAINT magic_link_tokens_pkey PRIMARY KEY (id);


--
-- Name: magic_link_tokens magic_link_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.magic_link_tokens
    ADD CONSTRAINT magic_link_tokens_token_unique UNIQUE (token);


--
-- Name: prompts prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prompts
    ADD CONSTRAINT prompts_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: idx_replit_database_migrations_v1_build_id; Type: INDEX; Schema: _system; Owner: -
--

CREATE UNIQUE INDEX idx_replit_database_migrations_v1_build_id ON _system.replit_database_migrations_v1 USING btree (build_id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: entries entries_prompt_id_prompts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entries
    ADD CONSTRAINT entries_prompt_id_prompts_id_fk FOREIGN KEY (prompt_id) REFERENCES public.prompts(id);


--
-- Name: entries entries_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entries
    ADD CONSTRAINT entries_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: feature_votes feature_votes_feature_id_features_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_votes
    ADD CONSTRAINT feature_votes_feature_id_features_id_fk FOREIGN KEY (feature_id) REFERENCES public.features(id);


--
-- PostgreSQL database dump complete
--

\unrestrict e1NEORyFYdtSZgv90nRmIsXKAM2iJztN8rZBIZZFDaG5gC5LruZCSmEac2P290s

