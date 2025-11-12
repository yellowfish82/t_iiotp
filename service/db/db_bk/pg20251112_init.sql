--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Ubuntu 17.4-1.pgdg24.04+2)
-- Dumped by pg_dump version 17.4 (Ubuntu 17.4-1.pgdg24.04+2)

-- Started on 2025-11-12 18:04:23 CST

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 83270)
-- Name: alert_condition; Type: TABLE; Schema: public; Owner: terry
--

CREATE TABLE public.alert_condition (
    id integer NOT NULL,
    thing_model_id integer,
    property_id integer,
    expression text,
    threshold text
);


ALTER TABLE public.alert_condition OWNER TO terry;

--
-- TOC entry 225 (class 1259 OID 83269)
-- Name: alert_condition_id_seq; Type: SEQUENCE; Schema: public; Owner: terry
--

CREATE SEQUENCE public.alert_condition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alert_condition_id_seq OWNER TO terry;

--
-- TOC entry 3513 (class 0 OID 0)
-- Dependencies: 225
-- Name: alert_condition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: terry
--

ALTER SEQUENCE public.alert_condition_id_seq OWNED BY public.alert_condition.id;


--
-- TOC entry 228 (class 1259 OID 83289)
-- Name: alert_data; Type: TABLE; Schema: public; Owner: terry
--

CREATE TABLE public.alert_data (
    id integer NOT NULL,
    ot_data integer,
    condition integer
);


ALTER TABLE public.alert_data OWNER TO terry;

--
-- TOC entry 227 (class 1259 OID 83288)
-- Name: alert_data_id_seq; Type: SEQUENCE; Schema: public; Owner: terry
--

CREATE SEQUENCE public.alert_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alert_data_id_seq OWNER TO terry;

--
-- TOC entry 3514 (class 0 OID 0)
-- Dependencies: 227
-- Name: alert_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: terry
--

ALTER SEQUENCE public.alert_data_id_seq OWNED BY public.alert_data.id;


--
-- TOC entry 224 (class 1259 OID 83256)
-- Name: ot; Type: TABLE; Schema: public; Owner: terry
--

CREATE TABLE public.ot (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    payload text NOT NULL,
    thing_id integer
);


ALTER TABLE public.ot OWNER TO terry;

--
-- TOC entry 220 (class 1259 OID 83228)
-- Name: thing_model_properties; Type: TABLE; Schema: public; Owner: terry
--

CREATE TABLE public.thing_model_properties (
    id integer NOT NULL,
    thing_model_id integer NOT NULL,
    name character varying(200) NOT NULL,
    min integer,
    max integer,
    type character varying
);


ALTER TABLE public.thing_model_properties OWNER TO terry;

--
-- TOC entry 229 (class 1259 OID 83305)
-- Name: alert_data_view; Type: VIEW; Schema: public; Owner: terry
--

CREATE VIEW public.alert_data_view AS
 SELECT ot."timestamp",
    ot.payload,
    alert_data.ot_data,
    alert_data.condition,
    alert_data.id,
    ot.thing_id,
    alert_condition.thing_model_id,
    alert_condition.property_id,
    alert_condition.expression,
    alert_condition.threshold,
    thing_model_properties.name
   FROM (((public.alert_data
     JOIN public.alert_condition ON ((alert_data.condition = alert_condition.id)))
     JOIN public.ot ON ((alert_data.ot_data = ot.id)))
     JOIN public.thing_model_properties ON ((alert_condition.property_id = thing_model_properties.id)));


ALTER VIEW public.alert_data_view OWNER TO terry;

--
-- TOC entry 223 (class 1259 OID 83255)
-- Name: ot_id_seq; Type: SEQUENCE; Schema: public; Owner: terry
--

CREATE SEQUENCE public.ot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ot_id_seq OWNER TO terry;

--
-- TOC entry 3515 (class 0 OID 0)
-- Dependencies: 223
-- Name: ot_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: terry
--

ALTER SEQUENCE public.ot_id_seq OWNED BY public.ot.id;


--
-- TOC entry 222 (class 1259 OID 83240)
-- Name: thing_instance; Type: TABLE; Schema: public; Owner: terry
--

CREATE TABLE public.thing_instance (
    id integer NOT NULL,
    thing_model_id integer,
    sn character varying(50) NOT NULL,
    status integer DEFAULT 0 NOT NULL,
    key character varying(100) NOT NULL,
    name character varying(300) NOT NULL,
    brand character varying(300) NOT NULL,
    note character varying(500),
    frequency integer DEFAULT 2
);


ALTER TABLE public.thing_instance OWNER TO terry;

--
-- TOC entry 221 (class 1259 OID 83239)
-- Name: thing_instance_id_seq; Type: SEQUENCE; Schema: public; Owner: terry
--

CREATE SEQUENCE public.thing_instance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.thing_instance_id_seq OWNER TO terry;

--
-- TOC entry 3516 (class 0 OID 0)
-- Dependencies: 221
-- Name: thing_instance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: terry
--

ALTER SEQUENCE public.thing_instance_id_seq OWNED BY public.thing_instance.id;


--
-- TOC entry 218 (class 1259 OID 83219)
-- Name: thing_model; Type: TABLE; Schema: public; Owner: terry
--

CREATE TABLE public.thing_model (
    id integer NOT NULL,
    name character varying(60) NOT NULL,
    description text
);


ALTER TABLE public.thing_model OWNER TO terry;

--
-- TOC entry 217 (class 1259 OID 83218)
-- Name: thing_model_id_seq; Type: SEQUENCE; Schema: public; Owner: terry
--

CREATE SEQUENCE public.thing_model_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.thing_model_id_seq OWNER TO terry;

--
-- TOC entry 3517 (class 0 OID 0)
-- Dependencies: 217
-- Name: thing_model_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: terry
--

ALTER SEQUENCE public.thing_model_id_seq OWNED BY public.thing_model.id;


--
-- TOC entry 219 (class 1259 OID 83227)
-- Name: thing_model_properties_id_seq; Type: SEQUENCE; Schema: public; Owner: terry
--

CREATE SEQUENCE public.thing_model_properties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.thing_model_properties_id_seq OWNER TO terry;

--
-- TOC entry 3518 (class 0 OID 0)
-- Dependencies: 219
-- Name: thing_model_properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: terry
--

ALTER SEQUENCE public.thing_model_properties_id_seq OWNED BY public.thing_model_properties.id;


--
-- TOC entry 3329 (class 2604 OID 83273)
-- Name: alert_condition id; Type: DEFAULT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.alert_condition ALTER COLUMN id SET DEFAULT nextval('public.alert_condition_id_seq'::regclass);


--
-- TOC entry 3330 (class 2604 OID 83292)
-- Name: alert_data id; Type: DEFAULT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.alert_data ALTER COLUMN id SET DEFAULT nextval('public.alert_data_id_seq'::regclass);


--
-- TOC entry 3328 (class 2604 OID 83259)
-- Name: ot id; Type: DEFAULT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.ot ALTER COLUMN id SET DEFAULT nextval('public.ot_id_seq'::regclass);


--
-- TOC entry 3325 (class 2604 OID 83243)
-- Name: thing_instance id; Type: DEFAULT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.thing_instance ALTER COLUMN id SET DEFAULT nextval('public.thing_instance_id_seq'::regclass);


--
-- TOC entry 3323 (class 2604 OID 83222)
-- Name: thing_model id; Type: DEFAULT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.thing_model ALTER COLUMN id SET DEFAULT nextval('public.thing_model_id_seq'::regclass);


--
-- TOC entry 3324 (class 2604 OID 83231)
-- Name: thing_model_properties id; Type: DEFAULT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.thing_model_properties ALTER COLUMN id SET DEFAULT nextval('public.thing_model_properties_id_seq'::regclass);


--
-- TOC entry 3505 (class 0 OID 83270)
-- Dependencies: 226
-- Data for Name: alert_condition; Type: TABLE DATA; Schema: public; Owner: terry
--

INSERT INTO public.alert_condition VALUES (3, 3, 4, '4', '585');
INSERT INTO public.alert_condition VALUES (4, 4, 12, '2', '110');
INSERT INTO public.alert_condition VALUES (5, 5, 13, '3', '12.9');


--
-- TOC entry 3507 (class 0 OID 83289)
-- Dependencies: 228
-- Data for Name: alert_data; Type: TABLE DATA; Schema: public; Owner: terry
--



--
-- TOC entry 3503 (class 0 OID 83256)
-- Dependencies: 224
-- Data for Name: ot; Type: TABLE DATA; Schema: public; Owner: terry
--



--
-- TOC entry 3501 (class 0 OID 83240)
-- Dependencies: 222
-- Data for Name: thing_instance; Type: TABLE DATA; Schema: public; Owner: terry
--

INSERT INTO public.thing_instance VALUES (2, 3, 'HLEgLiBb', 0, 'I^ZRAgM2@Q', '1号船舶主机系统', 'SDARI', NULL, 2);
INSERT INTO public.thing_instance VALUES (3, 4, 'ASdPXFem', 0, '%TQx6chmx5', '1号船舶辅机系统', 'CSSC', NULL, 2);
INSERT INTO public.thing_instance VALUES (4, 5, 'yskSHbqz', 0, 'MH39J56Hvr', '1号锅炉', 'SDARI', NULL, 2);


--
-- TOC entry 3497 (class 0 OID 83219)
-- Dependencies: 218
-- Data for Name: thing_model; Type: TABLE DATA; Schema: public; Owner: terry
--

INSERT INTO public.thing_model VALUES (3, '船舶主机系统', '主机系统是船舶推进动力的核心组成部分，通常由柴油机、传动轴系、螺旋桨等构成。');
INSERT INTO public.thing_model VALUES (4, '船舶辅机系统', '辅机系统主要为船舶提供 电力与辅助动力，包括发电机组、燃油泵、空压机、冷却水泵等。');
INSERT INTO public.thing_model VALUES (5, '船载锅炉', '船载锅炉为船舶提供 蒸汽与热能，用于燃油加热、生活热水、空调系统以及部分辅机驱动。');


--
-- TOC entry 3499 (class 0 OID 83228)
-- Dependencies: 220
-- Data for Name: thing_model_properties; Type: TABLE DATA; Schema: public; Owner: terry
--

INSERT INTO public.thing_model_properties VALUES (4, 3, 'rpm', NULL, NULL, 'mainEngine_rpm');
INSERT INTO public.thing_model_properties VALUES (5, 3, 'temp', NULL, NULL, 'mainEngine_cylinderTemp');
INSERT INTO public.thing_model_properties VALUES (6, 3, 'torque', NULL, NULL, 'mainEngine_torque');
INSERT INTO public.thing_model_properties VALUES (7, 3, 'power', NULL, NULL, 'mainEngine_power');
INSERT INTO public.thing_model_properties VALUES (8, 3, 'fuelFlow', NULL, NULL, 'mainEngine_fuelFlow');
INSERT INTO public.thing_model_properties VALUES (9, 4, 'rpm', NULL, NULL, 'auxEngine_rpm');
INSERT INTO public.thing_model_properties VALUES (10, 4, 'temp', NULL, NULL, 'auxEngine_oilTemp');
INSERT INTO public.thing_model_properties VALUES (11, 4, 'oilPressure', NULL, NULL, 'auxEngine_oilPressure');
INSERT INTO public.thing_model_properties VALUES (12, 4, 'current', NULL, NULL, 'auxEngine_current');
INSERT INTO public.thing_model_properties VALUES (13, 5, 'pressure', NULL, NULL, 'boiler_pressure');
INSERT INTO public.thing_model_properties VALUES (14, 5, 'current', NULL, NULL, 'boiler_flowRate');
INSERT INTO public.thing_model_properties VALUES (15, 5, 'temp', NULL, NULL, 'boiler_waterTemp');


--
-- TOC entry 3519 (class 0 OID 0)
-- Dependencies: 225
-- Name: alert_condition_id_seq; Type: SEQUENCE SET; Schema: public; Owner: terry
--

SELECT pg_catalog.setval('public.alert_condition_id_seq', 5, true);


--
-- TOC entry 3520 (class 0 OID 0)
-- Dependencies: 227
-- Name: alert_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: terry
--

SELECT pg_catalog.setval('public.alert_data_id_seq', 1, false);


--
-- TOC entry 3521 (class 0 OID 0)
-- Dependencies: 223
-- Name: ot_id_seq; Type: SEQUENCE SET; Schema: public; Owner: terry
--

SELECT pg_catalog.setval('public.ot_id_seq', 276, true);


--
-- TOC entry 3522 (class 0 OID 0)
-- Dependencies: 221
-- Name: thing_instance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: terry
--

SELECT pg_catalog.setval('public.thing_instance_id_seq', 4, true);


--
-- TOC entry 3523 (class 0 OID 0)
-- Dependencies: 217
-- Name: thing_model_id_seq; Type: SEQUENCE SET; Schema: public; Owner: terry
--

SELECT pg_catalog.setval('public.thing_model_id_seq', 5, true);


--
-- TOC entry 3524 (class 0 OID 0)
-- Dependencies: 219
-- Name: thing_model_properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: terry
--

SELECT pg_catalog.setval('public.thing_model_properties_id_seq', 15, true);


--
-- TOC entry 3340 (class 2606 OID 83277)
-- Name: alert_condition alert_condition_pkey; Type: CONSTRAINT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.alert_condition
    ADD CONSTRAINT alert_condition_pkey PRIMARY KEY (id);


--
-- TOC entry 3342 (class 2606 OID 83294)
-- Name: alert_data alert_data_pkey; Type: CONSTRAINT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.alert_data
    ADD CONSTRAINT alert_data_pkey PRIMARY KEY (id);


--
-- TOC entry 3338 (class 2606 OID 83263)
-- Name: ot ot_pkey; Type: CONSTRAINT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.ot
    ADD CONSTRAINT ot_pkey PRIMARY KEY (id);


--
-- TOC entry 3336 (class 2606 OID 83249)
-- Name: thing_instance thing_instance_pkey; Type: CONSTRAINT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.thing_instance
    ADD CONSTRAINT thing_instance_pkey PRIMARY KEY (id);


--
-- TOC entry 3332 (class 2606 OID 83226)
-- Name: thing_model thing_model_pkey; Type: CONSTRAINT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.thing_model
    ADD CONSTRAINT thing_model_pkey PRIMARY KEY (id);


--
-- TOC entry 3334 (class 2606 OID 83233)
-- Name: thing_model_properties thing_model_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.thing_model_properties
    ADD CONSTRAINT thing_model_properties_pkey PRIMARY KEY (id);


--
-- TOC entry 3346 (class 2606 OID 83283)
-- Name: alert_condition alert_condition_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.alert_condition
    ADD CONSTRAINT alert_condition_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.thing_model_properties(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3347 (class 2606 OID 83278)
-- Name: alert_condition alert_condition_thing_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.alert_condition
    ADD CONSTRAINT alert_condition_thing_model_id_fkey FOREIGN KEY (thing_model_id) REFERENCES public.thing_model(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3348 (class 2606 OID 83300)
-- Name: alert_data alert_data_condition_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.alert_data
    ADD CONSTRAINT alert_data_condition_fkey FOREIGN KEY (condition) REFERENCES public.alert_condition(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3349 (class 2606 OID 83295)
-- Name: alert_data alert_data_ot_data_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.alert_data
    ADD CONSTRAINT alert_data_ot_data_fkey FOREIGN KEY (ot_data) REFERENCES public.ot(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3345 (class 2606 OID 83264)
-- Name: ot ot_thing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.ot
    ADD CONSTRAINT ot_thing_id_fkey FOREIGN KEY (thing_id) REFERENCES public.thing_instance(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3344 (class 2606 OID 83250)
-- Name: thing_instance thing_instance_thing_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.thing_instance
    ADD CONSTRAINT thing_instance_thing_model_id_fkey FOREIGN KEY (thing_model_id) REFERENCES public.thing_model(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3343 (class 2606 OID 83234)
-- Name: thing_model_properties thing_model_properties_thing_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terry
--

ALTER TABLE ONLY public.thing_model_properties
    ADD CONSTRAINT thing_model_properties_thing_model_id_fkey FOREIGN KEY (thing_model_id) REFERENCES public.thing_model(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-11-12 18:04:23 CST

--
-- PostgreSQL database dump complete
--

